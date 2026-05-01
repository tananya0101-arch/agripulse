import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from app.database import get_session
from app.models import Article, GeneratedContent
import anthropic

router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/debug-key")
def debug_key():
    """Temporary debug endpoint — check API key status."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    masked = (api_key[:8] + "..." + api_key[-4:]) if len(api_key) > 12 else f"TOO_SHORT({len(api_key)})"
    is_placeholder = api_key == "your_api_key_here"
    try:
        client = anthropic.Anthropic(api_key=api_key) if api_key and not is_placeholder else None
        if not client:
            return {"key_present": bool(api_key), "key_masked": masked, "test": "no client"}
        msg = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=200,
            system="ตอบเป็น JSON เท่านั้น ห้ามมีข้อความนอก JSON",
            messages=[{"role": "user", "content": 'สรุปข่าว "ราคาปุ๋ยขึ้น 10%" ในรูปแบบ JSON: {"headline": "...", "summary": "..."}'}],
        )
        raw = msg.content[0].text
        import json as j
        try:
            start = raw.find("{"); end = raw.rfind("}") + 1
            parsed = j.loads(raw[start:end])
            parse_ok = True
        except Exception as pe:
            parsed = str(pe)
            parse_ok = False
    except Exception as e:
        return {"key_present": bool(api_key), "key_masked": masked, "error": f"{type(e).__name__}: {str(e)[:300]}"}
    return {"key_present": bool(api_key), "key_masked": masked, "raw_response": raw, "parse_ok": parse_ok, "parsed": parsed}

DISCLAIMER = "\n\n⚠️ สร้างโดย AI AgriPulse · ตรวจสอบข้อเท็จจริงก่อนใช้ · ดูแหล่งต้นฉบับเสมอ"

CONTENT_TYPE_LABELS = {
    "facebook_post": "Facebook Post",
    "tiktok_script": "TikTok Script",
    "line_oa": "LINE OA Message",
    "sales_talk": "Sales Talking Points",
    "farmer": "Farmer-Friendly Explanation",
    "executive": "Executive Summary",
}

TONE_LABELS = {
    "friendly": "เป็นมิตร เหมือนเพื่อนเล่าให้เพื่อนฟัง",
    "professional": "เป็นทางการและมืออาชีพ",
    "simple": "เรียบง่าย เข้าใจง่ายสำหรับทุกคน",
    "warning": "เตือนตลาด จริงจัง",
    "educational": "ให้ความรู้ มีสาระ",
}


def get_client():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        return None
    return anthropic.Anthropic(api_key=api_key)


class ContentRequest(BaseModel):
    article_id: int
    content_type: str = "facebook_post"
    tone: str = "friendly"
    user_id: str = "anonymous"


class SummaryRequest(BaseModel):
    article_id: int
    style: str = "shop_owner"   # shop_owner / farmer / analyst / simple


@router.post("/summarize")
def summarize(req: SummaryRequest, session: Session = Depends(get_session)):
    article = session.get(Article, req.article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    client = get_client()
    if not client:
        return {
            "article_id": req.article_id,
            "style": req.style,
            "summary": f"[Demo mode] {article.summary_ai or article.summary_short}{DISCLAIMER}",
            "source": article.source,
            "source_url": article.url,
        }

    style_instruction = {
        "shop_owner": "อธิบายในมุมมองของเจ้าของร้านปุ๋ย เน้นผลกระทบต่อต้นทุน สต็อก และการสื่อสารกับลูกค้า",
        "farmer": "อธิบายให้เกษตรกรเข้าใจง่าย ไม่ใช้ศัพท์วิชาการ เน้นสิ่งที่ควรทำต่อ",
        "analyst": "วิเคราะห์เชิงลึก แยกข้อเท็จจริงออกจากการตีความ ระบุความไม่แน่นอน",
        "simple": "สรุปสั้นๆ 3 ประโยค ใช้ภาษาง่าย",
    }.get(req.style, "สรุปเนื้อหาข่าวในภาษาไทยที่เข้าใจง่าย")

    source_text = f"ชื่อข่าว: {article.title}\nสรุปเบื้องต้น: {article.summary_short or ''}"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=600,
            system="คุณเป็นผู้ช่วย AI สำหรับธุรกิจเกษตรและปุ๋ยในไทย ตอบเป็นภาษาไทยเท่านั้น ห้ามแต่งข้อเท็จจริงที่ไม่มีในแหล่งข้อมูล",
            messages=[{"role": "user", "content": f"สรุปข่าวต่อไปนี้ตามสไตล์: {style_instruction}\n\n{source_text}\n\nแหล่งที่มา: {article.source}"}],
        )
        summary = message.content[0].text + DISCLAIMER
    except Exception:
        summary = f"[Demo] {article.summary_ai or article.summary_short or article.title}{DISCLAIMER}"
    return {
        "article_id": req.article_id,
        "style": req.style,
        "summary": summary,
        "source": article.source,
        "source_url": article.url,
    }


def _build_demo_content(article: "Article", content_type: str, tone: str) -> str:
    """Generate topic-aware demo content without an API key."""
    import json as j
    tags = j.loads(article.keywords) if article.keywords else []
    title = article.title_th or article.title
    source = article.source

    tags_str   = " ".join(str(t) for t in tags).lower()
    title_str  = title.lower()
    combined   = tags_str + " " + title_str
    is_rubber  = any(w in combined for w in ["rubber", "ยางพารา", "latex"])
    is_palm    = any(w in combined for w in ["palm_oil", "palm oil", "ปาล์ม"])
    is_durian  = any(w in combined for w in ["durian", "ทุเรียน"])
    is_urea    = any(w in combined for w in ["urea", "ยูเรีย"])
    is_india   = any(w in combined for w in ["india", "อินเดีย"])
    is_china   = any(w in combined for w in ["china", "จีน"])
    is_fert    = any(w in combined for w in ["fertilizer", "ปุ๋ย", "dap", "mop", "potash"])

    # ── derive topic-specific snippets ──────────────────────────
    if is_urea and is_india:
        topic_hook    = "อินเดียประมูลยูเรียใหม่ — ราคาปุ๋ยไทยจะไปทางไหน?"
        topic_body    = "อินเดีย ผู้นำเข้ายูเรียอันดับ 1 ของโลก เพิ่งเปิดประมูลใหม่อีกครั้ง\nราคา CFR ที่ได้รับสูงกว่าที่ตลาดคาดไว้ สะท้อนว่าอุปทานโลกยังตึงตัว\nสำหรับร้านปุ๋ยในไทย นี่คือสัญญาณว่าต้นทุนนำเข้าล็อตหน้าอาจปรับขึ้น\nแนะนำอย่าลดราคาก่อนทราบต้นทุนจริง และแจ้งลูกค้าล่วงหน้า"
        topic_impact  = "ต้นทุนยูเรียอาจขึ้นใน 4-8 สัปดาห์ ร้านปุ๋ยควรตรึงราคาไว้ก่อน"
        topic_action  = "ติดตามต้นทุนทดแทน / อย่าลดราคาก่อนรู้ต้นทุนล็อตหน้า"
        hashtags      = "#ยูเรีย #ปุ๋ยไทย #อินเดีย #ตลาดปุ๋ย #AgriPulse"
    elif is_china or (is_urea and is_fert):
        topic_hook    = "จีนส่งสัญญาณนโยบายใหม่ — กระทบปุ๋ยไทยแค่ไหน?"
        topic_body    = "จีนคือซัพพลายเออร์ปุ๋ยรายใหญ่ที่สุดในเอเชีย ทุกครั้งที่จีนปรับนโยบายส่งออก\nตลาดโลกได้รับผลกระทบทันที รวมถึงไทยที่นำเข้าปุ๋ยจากจีนเป็นสัดส่วนสำคัญ\nข่าวล่าสุดนี้บ่งบอกว่าผู้นำเข้าไทยต้องเฝ้าระวังต้นทุนในช่วง 1-2 เดือนนี้"
        topic_impact  = "อุปทานปุ๋ยจากจีนอาจลดลง กระทบราคานำเข้าของไทย"
        topic_action  = "ติดตามข่าวนโยบายส่งออกจีน / พิจารณาสต็อกล่วงหน้า"
        hashtags      = "#จีน #ปุ๋ยไทย #ตลาดเกษตร #AgriPulse"
    elif is_rubber:
        topic_hook    = "ราคายาง {trend} — เกษตรกรภาคใต้เตรียมรับมืออย่างไร?"
        topic_hook    = "ราคายางพาราเปลี่ยนแปลง — ส่งผลต่อสวนยางและร้านปุ๋ยอย่างไร?"
        topic_body    = "ยางพาราคือพืชเศรษฐกิจหลักของภาคใต้ไทย ราคาที่เปลี่ยนแปลงส่งผลโดยตรง\nต่อรายได้เกษตรกรและกำลังซื้อปัจจัยการผลิต\nเมื่อราคายางดี เกษตรกรมักลงทุนซื้อปุ๋ยและยาเพิ่ม — นั่นคือโอกาสของร้านปุ๋ย\nเมื่อราคาต่ำ ต้องช่วยลูกค้าวางแผนใช้ปุ๋ยอย่างมีประสิทธิภาพ"
        topic_impact  = "ราคายางดีหมายถึงกำลังซื้อปุ๋ยเพิ่ม ราคาต่ำต้องช่วยลูกค้าประหยัด"
        topic_action  = "ปรับกลยุทธ์ตามราคายาง / เสนอแพ็กเกจปุ๋ยที่คุ้มค่า"
        hashtags      = "#ยางพารา #ปุ๋ยยาง #ภาคใต้ #AgriPulse"
    elif is_durian:
        topic_hook    = "ตลาดทุเรียนไทยเคลื่อนไหว — ร้านปุ๋ยภาคใต้ควรรู้อะไร?"
        topic_body    = "ทุเรียนไทยส่งออกไปจีนกว่า 90% ทุกความเคลื่อนไหวในตลาดทุเรียน\nส่งผลต่อรายได้เกษตรกรและความต้องการปัจจัยการผลิตโดยตรง\nช่วงก่อนฤดูกาลทุเรียน เกษตรกรต้องการปุ๋ยบำรุงผลและเพิ่มคุณภาพ\nนี่คือโอกาสสำคัญสำหรับร้านปุ๋ยที่มีสต็อกปุ๋ยทุเรียนพร้อม"
        topic_impact  = "ราคาทุเรียนดีส่งผลให้ความต้องการปุ๋ยพรีเมียมสูงขึ้น"
        topic_action  = "เตรียมสต็อกปุ๋ยทุเรียนล่วงหน้า / แนะนำสูตรเพิ่มคุณภาพผล"
        hashtags      = "#ทุเรียน #ปุ๋ยทุเรียน #ส่งออก #AgriPulse"
    elif is_palm:
        topic_hook    = "ราคาปาล์มน้ำมันอัพเดท — ส่งผลต่อเกษตรกรภาคใต้อย่างไร?"
        topic_body    = "ปาล์มน้ำมันเป็นพืชเศรษฐกิจสำคัญของภาคใต้และตะวันออก\nราคาขึ้นอยู่กับทั้งความต้องการน้ำมันพืชโลกและนโยบายพลังงานในประเทศ\nเมื่อราคาปาล์มดี เกษตรกรมักเพิ่มการดูแลสวนและลงทุนซื้อปุ๋ย\nโดยเฉพาะปุ๋ยโพแทสเซียมและ NPK ที่สำคัญต่อการออกทะลาย"
        topic_impact  = "ราคาปาล์มส่งผลต่อความต้องการปุ๋ยโพแทสเซียมและ NPK ในภาคใต้"
        topic_action  = "เตรียมสต็อกปุ๋ยปาล์ม / แนะนำโปรแกรมใส่ปุ๋ยที่เหมาะสม"
        hashtags      = "#ปาล์มน้ำมัน #ปุ๋ยปาล์ม #ภาคใต้ #AgriPulse"
    else:
        topic_hook    = "ข่าวเกษตรที่ร้านปุ๋ยและเกษตรกรต้องรู้วันนี้"
        topic_body    = "ตลาดเกษตรและปัจจัยการผลิตมีความเคลื่อนไหวตลอดเวลา\nการติดตามข่าวสารอย่างใกล้ชิดช่วยให้ตัดสินใจทางธุรกิจได้ดีขึ้น\nทั้งเรื่องการสต็อกสินค้า การตั้งราคา และการสื่อสารกับลูกค้า"
        topic_impact  = "ตลาดเกษตรผันผวน ต้องติดตามข้อมูลรายวัน"
        topic_action  = "ติดตามราคาตลาดสม่ำเสมอ / ปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจใหญ่"
        hashtags      = "#ตลาดเกษตร #ปุ๋ยไทย #AgriPulse"

    # ── assemble by content type ─────────────────────────────────
    if content_type == "facebook_post":
        return f"""📣 {topic_hook}

{title}

━━━━━━━━━━━━━━━━━━━━
{topic_body}
━━━━━━━━━━━━━━━━━━━━

💡 สิ่งที่ควรทำตอนนี้:
👉 {topic_action}

📌 แหล่งข่าว: {source}

{hashtags}"""

    elif content_type == "tiktok_script":
        return f"""🎬 HOOK (3–5 วินาที)
"{topic_hook}"

━━━━━━━━━━━━━━━━━━━━
📝 สคริปต์หลัก (20–30 วินาที)
{topic_body}

━━━━━━━━━━━━━━━━━━━━
💥 ผลกระทบ (5–8 วินาที)
{topic_impact}

━━━━━━━━━━━━━━━━━━━━
🎯 CTA (3–5 วินาที)
"ติดตาม AgriPulse ไว้เลย อัพเดทตลาดเกษตรและปุ๋ยทุกวัน!"

━━━━━━━━━━━━━━━━━━━━
📷 ภาพ/บรรยากาศที่แนะนำ:
- ภาพกราฟราคาหรือข้อมูลตลาด
- ภาพสวนยาง / ปาล์ม / ทุเรียน หรือบรรยากาศร้านปุ๋ย
- ตัวอักษรใหญ่บนหน้าจอช่วงพูดประเด็นสำคัญ

{hashtags} #TikTokเกษตร"""

    elif content_type == "line_oa":
        return f"""📢 AgriPulse อัพเดทตลาด

🔔 {topic_hook}

📌 สรุป:
{topic_body}

💡 แนะนำ:
{topic_action}

📰 ที่มา: {source}
─────────────────
💬 สอบถามราคาหรือข้อมูลปุ๋ยวันนี้ ทักมาได้เลยครับ/ค่ะ"""

    elif content_type == "sales_talk":
        return f"""🗣️ จุดสนทนากับลูกค้า

📰 ข่าว: {title}
📌 แหล่ง: {source}

━━━━━━━━━━━━━━━━━━━━
✅ สิ่งที่ควรบอกลูกค้า:
• {topic_impact}
• {topic_action}
• ตลาดมีความผันผวน แนะนำวางแผนสต็อกล่วงหน้า

❌ สิ่งที่ไม่ควรพูด:
• อย่าสัญญาราคาแน่นอนก่อนทราบต้นทุนจริง
• อย่าบอกว่า "ราคาจะขึ้น/ลงแน่นอน" — ตลาดยังไม่แน่นอน

🎯 มุมมองสินค้า:
• เน้นคุณภาพและความน่าเชื่อถือของสินค้า
• เสนอคำแนะนำการใช้ปุ๋ยที่ถูกต้องเพื่อสร้างความไว้วางใจ"""

    elif content_type == "farmer":
        return f"""👨‍🌾 อัพเดทตลาดสำหรับเกษตรกร

📰 {title}

━━━━━━━━━━━━━━━━━━━━
🌾 สรุปแบบเข้าใจง่าย:
{topic_body}

━━━━━━━━━━━━━━━━━━━━
💡 สิ่งที่เกษตรกรควรทำ:
{topic_action}

⚠️ ข้อควรระวัง:
ราคาตลาดเปลี่ยนแปลงได้ตลอด ควรติดตามข่าวและปรึกษาร้านปุ๋ยที่ไว้วางใจได้ก่อนตัดสินใจซื้อปริมาณมาก"""

    else:  # executive
        return f"""📊 สรุปผู้บริหาร

ข่าว: {title}
แหล่ง: {source}

สาระสำคัญ:
{topic_impact}

แนวทางที่แนะนำ:
{topic_action}

ความเสี่ยง: ตลาดยังมีความไม่แน่นอน ควรติดตามข้อมูลต่อเนื่องก่อนตัดสินใจเชิงกลยุทธ์"""


@router.post("/generate-content")
def generate_content(req: ContentRequest, session: Session = Depends(get_session)):
    article = session.get(Article, req.article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    client = get_client()
    type_label = CONTENT_TYPE_LABELS.get(req.content_type, req.content_type)
    tone_label = TONE_LABELS.get(req.tone, req.tone)

    if not client:
        body = _build_demo_content(article, req.content_type, req.tone) + DISCLAIMER
        content = GeneratedContent(
            user_id=req.user_id,
            article_id=req.article_id,
            content_type=req.content_type,
            tone=req.tone,
            language="th",
            body=body,
        )
        session.add(content)
        session.commit()
        session.refresh(content)
        return {"id": content.id, "content_type": req.content_type, "tone": req.tone, "body": body}

    format_instructions = {
        "facebook_post": "เขียน Facebook post ที่มี: Hook, อธิบายข่าว, ผลกระทบในไทย, คำแนะนำ, CTA, และ Hashtags",
        "tiktok_script": "เขียนสคริปต์ TikTok 30-45 วินาที มี hook 3 วินาที, เนื้อหาหลัก, และ CTA",
        "line_oa": "เขียนข้อความ LINE OA สั้น กระชับ 5-7 บรรทัด เหมาะกับการแจ้งลูกค้า",
        "sales_talk": "เขียนจุดสนทนาสำหรับพนักงานขาย แยกเป็น: สิ่งที่ควรบอก, สิ่งที่ไม่ควรสัญญา, และมุมมองสินค้า",
        "farmer": "อธิบายข่าวนี้ให้เกษตรกรเข้าใจง่าย ไม่ใช้ศัพท์วิชาการ มีคำแนะนำเชิงปฏิบัติ",
        "executive": "สรุปสั้นๆ 3-5 ประโยคสำหรับผู้บริหาร เน้นนัยสำคัญทางธุรกิจ",
    }.get(req.content_type, "เขียนเนื้อหาที่เหมาะสม")

    source_text = f"ชื่อข่าว: {article.title}\nชื่อภาษาไทย: {article.title_th or ''}\nสรุป: {article.summary_short or ''}\nแหล่ง: {article.source}"

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=800,
            system="คุณเป็น content writer ผู้เชี่ยวชาญด้านธุรกิจเกษตรและปุ๋ยในไทย เขียนเนื้อหาเป็นภาษาไทย ห้ามคัดลอกบทความต้นฉบับ ห้ามแต่งข้อเท็จจริงที่ไม่มีในแหล่งข้อมูล",
            messages=[{"role": "user", "content": f"สร้าง {type_label} จากข่าวต่อไปนี้ โทน: {tone_label}\n\n{source_text}\n\nคำสั่ง: {format_instructions}"}],
        )
        body = message.content[0].text + DISCLAIMER
    except Exception:
        body = _build_demo_content(article, req.content_type, req.tone)
    content = GeneratedContent(
        user_id=req.user_id,
        article_id=req.article_id,
        content_type=req.content_type,
        tone=req.tone,
        language="th",
        body=body,
    )
    session.add(content)
    session.commit()
    session.refresh(content)
    return {"id": content.id, "content_type": req.content_type, "tone": req.tone, "body": body}


@router.get("/brief")
def daily_brief(session: Session = Depends(get_session)):
    """Return a pre-built or generated daily market brief."""
    from sqlmodel import select
    from app.models import Article, Price
    from datetime import datetime, timedelta

    since = datetime.utcnow() - timedelta(hours=24)
    recent_articles = session.exec(
        select(Article)
        .where(Article.is_approved == True, Article.published_at >= since)
        .order_by(Article.published_at.desc())
        .limit(10)
    ).all()

    prices = session.exec(select(Price).order_by(Price.date.desc())).all()

    client = get_client()
    if not client or not recent_articles:
        return {
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "generated_at": datetime.utcnow().isoformat(),
            "fertilizer_summary": "ตลาดยูเรียยังมีความอ่อนไหวจากกิจกรรมประมูลอินเดีย ราคา FOB ตะวันออกกลางมีแนวโน้มสูงขึ้น จีนขึ้นค่าตรวจสอบส่งออกซึ่งอาจจำกัดอุปทานยูเรียจีนในตลาดโลก",
            "crop_summary": "ยางพาราภาคใต้ราคาทรงตัวหลังฝนกลับมา คาดว่าความต้องการปุ๋ยสวนยางจะเพิ่มขึ้นใน 4-6 สัปดาห์ ปาล์มน้ำมันยังทรงตัวระดับต่ำแต่มีแนวโน้มฟื้นตัวในเดือนหน้า",
            "thailand_impact": "ร้านปุ๋ยไทยควรระวังต้นทุนทดแทนยูเรียก่อนลดราคา ฤดูกาลใส่ปุ๋ยยางกำลังจะมาถึงในภาคใต้",
            "south_thailand_impact": "ฝนที่กลับมาในภาคใต้ตอนล่างเป็นสัญญาณว่าเกษตรกรจะเริ่มกรีดยางและใส่ปุ๋ยเร็วๆ นี้ เตรียมสต็อกปุ๋ยยูเรียและ NPK ไว้",
            "risk_signals": [
                {"level": "high", "message": "ต้นทุนยูเรีย: อุปทานโลกตึงตัวจากการประมูลอินเดีย อาจกระทบต้นทุนนำเข้าไทย"},
                {"level": "medium", "message": "นโยบายจีน: จีนเพิ่มค่าตรวจสอบส่งออก ติดตามสัปดาห์หน้า"},
            ],
            "business_actions": [
                "ระวังการลดราคายูเรียก่อนทราบต้นทุนทดแทน",
                "เตรียมสต็อกปุ๋ยสวนยางสำหรับฤดูกาลใส่ปุ๋ย",
                "สื่อสารความผันผวนราคาอย่างระมัดระวังกับลูกค้า",
            ],
            "content_ideas": [
                "ราคายูเรียขึ้นหรือลง? นี่คือสิ่งที่ร้านปุ๋ยควรรู้",
                "ทำไมฝนถึงทำให้ความต้องการปุ๋ยยางเพิ่มขึ้น",
                "อินเดียประมูลยูเรีย กระทบราคาปุ๋ยในไทยอย่างไร?",
            ],
            "top_articles": [{"id": a.id, "title": a.title_th or a.title, "source": a.source} for a in recent_articles[:5]],
            "prices": [{"product_th": p.product_th, "price": p.price, "currency": p.currency,
                        "unit": p.unit, "trend_direction": p.trend_direction, "change_percent": p.change_percent,
                        "source": p.source, "date": p.date} for p in prices],
        }

    # AI-generated brief
    import json as json_lib
    headlines = "\n".join([f"- {a.title_th or a.title} ({a.source})" for a in recent_articles[:8]])
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1200,
            system="คุณเป็นนักวิเคราะห์ตลาดเกษตรและปุ๋ยสำหรับตลาดไทย สร้างสรุปตลาดรายวันเป็นภาษาไทย แยกข้อเท็จจริงออกจากการตีความเสมอ",
            messages=[{"role": "user", "content": f"สรุปตลาดปุ๋ยและเกษตรวันนี้จากข่าวต่อไปนี้:\n{headlines}\n\nตอบในรูปแบบ JSON ที่มีหัวข้อ: fertilizer_summary, crop_summary, thailand_impact, south_thailand_impact, risk_signals (list), business_actions (list), content_ideas (list)"}],
        )
        text = message.content[0].text
        start = text.find("{")
        end = text.rfind("}") + 1
        data = json_lib.loads(text[start:end])
    except Exception:
        data = {
            "fertilizer_summary": "ตลาดปุ๋ยโลกมีความผันผวนในช่วงนี้ ติดตามข่าวอย่างต่อเนื่อง",
            "crop_summary": "ราคาพืชผลทางการเกษตรอยู่ในระดับทรงตัว",
            "thailand_impact": "ผู้ประกอบการปุ๋ยควรติดตามต้นทุนนำเข้าอย่างใกล้ชิด",
            "south_thailand_impact": "ภาคใต้ควรเตรียมพร้อมรับมือความผันผวนราคายางและปาล์ม",
            "risk_signals": [{"level": "medium", "message": "ความผันผวนราคาปุ๋ยโลก"}],
            "business_actions": ["ติดตามต้นทุนทดแทนก่อนปรับราคา", "สื่อสารกับลูกค้าอย่างระมัดระวัง"],
            "content_ideas": ["ราคาปุ๋ยวันนี้", "แนวโน้มตลาดเกษตร"],
        }

    data["date"] = datetime.utcnow().strftime("%Y-%m-%d")
    data["generated_at"] = datetime.utcnow().isoformat()
    data["top_articles"] = [{"id": a.id, "title": a.title_th or a.title, "source": a.source} for a in recent_articles[:5]]
    data["prices"] = [{"product_th": p.product_th, "price": p.price, "currency": p.currency,
                       "unit": p.unit, "trend_direction": p.trend_direction, "change_percent": p.change_percent,
                       "source": p.source, "date": p.date} for p in prices]
    return data


# ─────────────────────────────────────────────────────────────
# FULL ARTICLE — generates a complete Thai-language article
# from headline + tags so users never need to leave the app.
# ─────────────────────────────────────────────────────────────

FULL_ARTICLE_SYSTEM = """คุณเป็นนักเขียนข่าวเกษตรและปุ๋ยสำหรับตลาดไทย ตอบเป็น JSON เท่านั้น ห้ามมีข้อความนอก JSON ใช้ภาษาไทยที่อ่านง่าย ห้ามแต่งตัวเลขที่ไม่มีในข่าว"""

FULL_ARTICLE_PROMPT = """สร้างบทความข่าวภาษาไทยจากข้อมูลด้านล่าง ตอบเป็น JSON เท่านั้น

ชื่อข่าว: {title}
แหล่งข่าว: {source}
หมวดหมู่: {tags}
วันที่: {date}

{{
  "headline_th": "หัวข้อภาษาไทยที่น่าสนใจ",
  "summary": "สรุป 2-3 ประโยค",
  "body": "เนื้อหา 4-5 ย่อหน้า: (1) เหตุการณ์และบริบท (2) ผลกระทบตลาดโลก (3) ผลกระทบต่อไทย (4) แนะนำสิ่งที่ควรทำ",
  "thailand_impact": "ผลกระทบต่อไทย 2-3 ประโยค",
  "south_thailand_impact": "ผลกระทบภาคใต้ 1-2 ประโยค",
  "business_tip": "คำแนะนำร้านปุ๋ย 2-3 ข้อ",
  "key_facts": ["ข้อเท็จจริงที่ 1", "ข้อเท็จจริงที่ 2", "ข้อเท็จจริงที่ 3"],
  "uncertainty_note": "ปัจจัยที่ยังไม่แน่นอน"
}}"""


def build_demo_article(article: "Article") -> dict:
    """Demo full article when no API key — uses structured template."""
    import json as j
    tags = j.loads(article.keywords) if article.keywords else []
    is_rubber = any(t in ["rubber", "ยางพารา"] for t in tags)
    is_palm = any(t in ["palm_oil", "ปาล์ม", "palm oil"] for t in tags)
    is_durian = any(t in ["durian", "ทุเรียน"] for t in tags)
    is_urea = any(t in ["urea", "ยูเรีย"] for t in tags)
    is_india = any(t in ["India", "india-tender"] for t in tags)
    is_china = any(t in ["China", "china-export"] for t in tags)

    title = article.title_th or article.title

    if is_urea and is_india:
        body = f"""ตลาดยูเรียโลกได้รับความสนใจอีกครั้ง หลังจากมีรายงานเกี่ยวกับ "{title}"

**บริบทตลาดโลก**
อินเดียเป็นผู้นำเข้ายูเรียรายใหญ่ที่สุดของโลก การประมูลแต่ละครั้งส่งสัญญาณสำคัญต่อราคาตลาดโลก โดยเฉพาะราคา FOB จากตะวันออกกลาง ซึ่งเป็นแหล่งนำเข้าหลักของไทย

**สถานการณ์ปัจจุบัน**
เมื่อราคา CFR ในการประมูลสูงกว่าที่ตลาดคาด มักหมายความว่าอุปทานโลกตึงตัว ซึ่งอาจส่งผลให้ราคานำเข้าของไทยปรับขึ้นตามในช่วง 4-8 สัปดาห์ถัดไป

**ปัจจัยที่ต้องติดตาม**
นอกจากอินเดียแล้ว ควรติดตามนโยบายส่งออกจีน ซึ่งเป็นอีกหนึ่งซัพพลายเออร์รายใหญ่ หากจีนจำกัดการส่งออกพร้อมกัน แรงกดดันด้านราคาจะยิ่งเพิ่มขึ้น"""
        thailand = "ผู้นำเข้าไทยควรเฝ้าระวังต้นทุนทดแทนในช่วง 1-2 เดือนนี้ ร้านปุ๋ยไม่ควรลดราคาก่อนทราบต้นทุนจริงของล็อตถัดไป"
        south = "ภาคใต้ใช้ยูเรียหลักในสวนยางและปาล์ม หากราคานำเข้าขึ้น ร้านปุ๋ยในพื้นที่ควรแจ้งลูกค้าล่วงหน้าเพื่อให้วางแผนการซื้อได้"
        tip = "รอดูต้นทุนทดแทนก่อนปรับราคาขาย สื่อสารกับลูกค้าว่าตลาดมีความผันผวน"
        facts = ["อินเดียเป็นผู้นำเข้ายูเรียรายใหญ่สุดของโลก", "ราคา CFR ในการประมูลสูงกว่าคาด", "อาจกระทบต้นทุนนำเข้าไทยใน 4-8 สัปดาห์"]
    elif is_rubber:
        body = f"""ตลาดยางพาราได้รับรายงานใหม่ "{title}"

**บริบทตลาดยาง**
ราคายางพาราไทยถูกกำหนดโดยหลายปัจจัย ทั้งความต้องการจากจีน (คู่ค้าหลัก) ปริมาณผลผลิตในประเทศ และสภาพอากาศในพื้นที่ปลูกหลัก

**สถานการณ์ปัจจุบัน**
ฤดูฝนและสภาพอากาศมีผลโดยตรงต่อปริมาณน้ำยาง ช่วงที่ฝนตกชุกมักทำให้ผลผลิตลดลงชั่วคราว ส่งผลให้ราคาปรับขึ้นเล็กน้อย

**ความต้องการปุ๋ย**
หลังจากหน้าแล้งหรือช่วงฝนกลับมา เกษตรกรมักใส่ปุ๋ยบำรุงสวนยาง โดยเฉพาะยูเรียและ NPK ซึ่งเป็นโอกาสสำคัญสำหรับร้านปุ๋ยในภาคใต้"""
        thailand = "ราคายางพาราส่งผลโดยตรงต่อกำลังซื้อของเกษตรกรในภาคใต้ ราคาที่ดีหมายถึงความสามารถในการซื้อปุ๋ยที่มากขึ้น"
        south = "ภาคใต้เป็นแหล่งผลิตยางพาราหลักของไทย จังหวัดยะลา ปัตตานี นราธิวาส สงขลา และเบตงมีพื้นที่ปลูกยางรวมกันหลายล้านไร่"
        tip = "ติดตามราคายางใกล้ชิด หากราคาดีต่อเนื่อง เกษตรกรมีแนวโน้มซื้อปุ๋ยมากขึ้นในช่วง 2-4 สัปดาห์"
        facts = ["ยางพาราเป็นพืชเศรษฐกิจหลักของภาคใต้", "ราคายางขึ้นอยู่กับความต้องการจากจีน", "ฤดูฝนมีผลต่อปริมาณผลผลิต"]
    elif is_durian:
        body = f"""ตลาดทุเรียนได้รับรายงาน "{title}"

**ตลาดทุเรียนไทย**
ทุเรียนไทยเป็นสินค้าเกษตรส่งออกมูลค่าสูง โดยมีจีนเป็นตลาดหลักที่รับซื้อกว่า 90% ของการส่งออกทั้งหมด ราคาทุเรียนจึงผูกติดกับความต้องการและนโยบายนำเข้าของจีนอย่างใกล้ชิด

**สถานการณ์ปัจจุบัน**
ฤดูกาลทุเรียนภาคตะวันออก (จันทบุรี ระยอง ตราด) มักเริ่มก่อนภาคใต้ ความต้องการจากจีนและราคารับซื้อมีผลต่อรายได้เกษตรกรโดยตรง

**ความต้องการปุ๋ย**
สวนทุเรียนต้องการปุ๋ยบำรุงสม่ำเสมอตลอดปี โดยเฉพาะช่วงก่อนและหลังติดผล ปุ๋ยที่นิยมใช้ได้แก่ NPK สูตรต่างๆ และปุ๋ยอินทรีย์"""
        thailand = "ราคาทุเรียนที่ดีส่งผลให้เกษตรกรมีกำลังซื้อปุ๋ยและปัจจัยการผลิตมากขึ้น"
        south = "ทุเรียนภาคใต้ โดยเฉพาะในพื้นที่ภูเขา เช่น นราธิวาส ยะลา และสตูล มีคุณภาพสูงและราคาดี"
        tip = "ช่วงก่อนฤดูกาลทุเรียนคือโอกาสในการขายปุ๋ยบำรุงผลไม้"
        facts = ["จีนรับซื้อทุเรียนไทยกว่า 90% ของการส่งออก", "ราคาทุเรียนผันผวนตามความต้องการจีน", "ภาคตะวันออกผลิตก่อนภาคใต้"]
    else:
        body = f"""รายงานล่าสุดจากตลาดเกษตร: "{title}"

**บริบทตลาด**
ตลาดสินค้าเกษตรและปัจจัยการผลิตมีความเคลื่อนไหวอย่างต่อเนื่อง ได้รับผลกระทบจากทั้งปัจจัยในประเทศ เช่น สภาพอากาศและฤดูกาล และปัจจัยต่างประเทศ เช่น ราคาตลาดโลกและนโยบายของประเทศผู้ผลิตรายใหญ่

**สิ่งที่ควรติดตาม**
ผู้ประกอบการในธุรกิจเกษตรควรติดตามข้อมูลนี้อย่างใกล้ชิด เพื่อวางแผนการซื้อขายและสต็อกสินค้าได้อย่างเหมาะสม

**แนวโน้ม**
ตลาดเกษตรไทยยังคงมีความผันผวนจากปัจจัยภายนอก ทั้งราคาพลังงาน ค่าเงิน และนโยบายการค้าระหว่างประเทศ"""
        thailand = "ธุรกิจเกษตรไทยต้องปรับตัวให้ทันกับการเปลี่ยนแปลงของตลาดโลกอย่างต่อเนื่อง"
        south = "ภาคใต้ไทยพึ่งพาพืชเศรษฐกิจหลัก 3 ชนิด คือ ยางพารา ปาล์มน้ำมัน และทุเรียน ซึ่งล้วนได้รับผลกระทบจากตลาดโลก"
        tip = "ติดตามข่าวสารตลาดอย่างสม่ำเสมอเพื่อตัดสินใจทางธุรกิจได้อย่างมีข้อมูล"
        facts = [f"ข่าวจาก: {article.source}", "ตลาดเกษตรมีความผันผวนสูง", "ควรติดตามข้อมูลรายวัน"]

    return {
        "article_id": article.id,
        "headline_th": title,
        "summary": article.summary_ai or f"สรุปข่าว: {title} — รายงานโดย {article.source}",
        "body": body,
        "thailand_impact": thailand,
        "south_thailand_impact": south,
        "business_tip": tip,
        "key_facts": facts,
        "uncertainty_note": "ข้อมูลด้านบนเป็นการวิเคราะห์บริบท ตัวเลขและผลกระทบที่แน่ชัดขึ้นอยู่กับปัจจัยหลายอย่าง ควรติดตามข่าวต่อเนื่อง",
        "source": article.source,
        "source_url": article.url,
        "published_at": article.published_at.isoformat(),
        "generated_by": "demo",
    }


@router.get("/full-article/{article_id}")
def full_article(article_id: int, session: Session = Depends(get_session)):
    """Return a complete Thai-language article — no external link needed."""
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Return cached version if exists and content is detailed enough (>800 chars)
    if article.summary_ai and article.impact_thailand and len(article.summary_ai) > 800:
        return {
            "article_id": article.id,
            "headline_th": article.title_th or article.title,
            "summary": article.summary_short or article.summary_ai[:200],
            "body": article.summary_ai,
            "thailand_impact": article.impact_thailand,
            "south_thailand_impact": article.impact_south_thailand,
            "business_tip": article.business_recommendation,
            "key_facts": article.keywords if isinstance(article.keywords, list) else [],
            "uncertainty_note": None,
            "source": article.source,
            "source_url": article.url,
            "published_at": article.published_at.isoformat(),
            "generated_by": "cached",
        }

    client = get_client()
    if not client:
        import sys
        print("⚠️ No Anthropic client — API key missing or placeholder", file=sys.stderr, flush=True)
        return build_demo_article(article)

    import json as j
    tags_str = ", ".join(j.loads(article.keywords)) if article.keywords else ""
    prompt = FULL_ARTICLE_PROMPT.format(
        title=article.title,
        source=article.source,
        tags=tags_str,
        date=article.published_at.strftime("%Y-%m-%d"),
    )

    try:
        message = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=1500,
            system=FULL_ARTICLE_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        text = message.content[0].text
        start = text.find("{")
        end = text.rfind("}") + 1
        data = j.loads(text[start:end])
    except Exception as e:
        import sys
        print(f"❌ AI full-article error: {type(e).__name__}: {e}", file=sys.stderr, flush=True)
        return build_demo_article(article)

    # Cache in DB
    if data.get("body"):
        article.summary_ai = data.get("body", "")
        article.impact_thailand = data.get("thailand_impact", "")
        article.impact_south_thailand = data.get("south_thailand_impact", "")
        article.business_recommendation = data.get("business_tip", "")
        article.title_th = article.title_th or data.get("headline_th", article.title)
        session.add(article)
        session.commit()

    data["article_id"] = article.id
    data["source"] = article.source
    data["source_url"] = article.url
    data["published_at"] = article.published_at.isoformat()
    data["generated_by"] = "ai"
    return data
