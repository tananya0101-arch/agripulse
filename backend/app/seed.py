"""Seed the database with MVP topics, sources, prices, and sample articles."""
import json
from datetime import datetime, timedelta
from sqlmodel import Session, select
from app.database import engine
from app.models import Article, Source, Topic, Price


def seed_topics(session: Session):
    if session.exec(select(Topic)).first():
        return
    topics = [
        Topic(slug="rubber", name="Rubber", name_th="ยางพารา", category="crop", emoji="🌿",
              synonyms='["natural rubber","latex","para rubber","ยาง"]'),
        Topic(slug="palm-oil", name="Palm Oil", name_th="ปาล์มน้ำมัน", category="crop", emoji="🌴",
              synonyms='["CPO","crude palm oil","palm fruit","ปาล์ม","ทะลายปาล์ม"]'),
        Topic(slug="durian", name="Durian", name_th="ทุเรียน", category="crop", emoji="🌟",
              synonyms='["monthong","musang king","ทุเรียนไทย"]'),
        Topic(slug="rice", name="Rice", name_th="ข้าว", category="crop", emoji="🌾",
              synonyms='["Thai rice","jasmine rice","ข้าวหอมมะลิ","ข้าวไทย"]'),
        Topic(slug="urea", name="Urea", name_th="ยูเรีย", category="fertilizer", emoji="⚗️",
              synonyms='["46-0-0","nitrogen fertilizer","ปุ๋ยไนโตรเจน","46-0-0"]'),
        Topic(slug="dap", name="DAP", name_th="DAP", category="fertilizer", emoji="🧪",
              synonyms='["diammonium phosphate","18-46-0","phosphate fertilizer","ฟอสเฟต"]'),
        Topic(slug="mop", name="MOP / Potash", name_th="โพแทช", category="fertilizer", emoji="🧪",
              synonyms='["potassium chloride","muriate of potash","potash","โพแทสเซียม","MOP"]'),
        Topic(slug="china-export", name="China Fertilizer Export", name_th="จีนส่งออกปุ๋ย", category="country", emoji="🇨🇳",
              synonyms='["China urea export","China MOP","จีนปุ๋ย","ส่งออกปุ๋ยจีน"]'),
        Topic(slug="india-tender", name="India Urea Tender", name_th="อินเดียประมูลยูเรีย", category="event", emoji="🇮🇳",
              synonyms='["India fertilizer tender","MMTC tender","India urea","อินเดียยูเรีย"]'),
        Topic(slug="thailand-market", name="Thailand Fertilizer Market", name_th="ตลาดปุ๋ยไทย", category="country", emoji="🇹🇭",
              synonyms='["Thai fertilizer","ปุ๋ยไทย","ตลาดปุ๋ย"]'),
    ]
    for t in topics:
        session.add(t)
    session.commit()


def seed_sources(session: Session):
    if session.exec(select(Source)).first():
        return
    sources = [
        Source(name="Reuters Commodities", url="https://www.reuters.com", source_type="news",
               trust_score="high", license_status="headline_and_link_only"),
        Source(name="กรมวิชาการเกษตร", url="https://www.doa.go.th", source_type="government",
               trust_score="high", license_status="headline_and_link_only"),
        Source(name="FAO AMIS", url="https://amis.fao.org", source_type="price",
               trust_score="high", license_status="headline_and_link_only"),
        Source(name="Fertilizer Week", url="https://www.crugroup.com", source_type="industry",
               trust_score="medium", license_status="headline_and_link_only"),
        Source(name="ข่าวยางพารา (RAOT)", url="https://www.rubber.co.th", source_type="government",
               trust_score="high", license_status="headline_and_link_only"),
    ]
    for s in sources:
        session.add(s)
    session.commit()


def seed_prices(session: Session):
    if session.exec(select(Price)).first():
        return
    today = datetime.utcnow().strftime("%Y-%m-%d")
    prices = [
        Price(product="Urea Granular", product_th="ยูเรีย", price=858, currency="USD", unit="metric_ton",
              price_type="FOB", region="Middle East", source="Investing.com", date=today,
              trend_direction="up", change_percent=4.5,
              notes="Urea Granular FOB Middle East — India tender activity supporting prices"),
        Price(product="DAP", product_th="DAP", price=610, currency="USD", unit="metric_ton",
              price_type="FOB", region="North Africa", source="Reuters", date=today,
              trend_direction="flat", change_percent=0.0),
        Price(product="MOP", product_th="โพแทช", price=290, currency="USD", unit="metric_ton",
              price_type="CFR", region="Southeast Asia", source="Reuters", date=today,
              trend_direction="down", change_percent=-1.5),
        Price(product="Rubber Sheet RSS3", product_th="ยางแผ่น RSS3", price=58.50, currency="THB", unit="kg",
              price_type="local_market", region="Southern Thailand", source="RAOT", date=today,
              trend_direction="flat", change_percent=-0.3),
        Price(product="Fresh Latex DRC 60%", product_th="น้ำยางสด DRC 60%", price=53.50, currency="THB", unit="kg",
              price_type="farmgate", region="Southern Thailand", source="RAOT", date=today,
              trend_direction="up", change_percent=1.9,
              notes="ราคารับซื้อน้ำยางสด DRC 60% เฉลี่ยระดับประเทศ"),
        Price(product="Palm FFB", product_th="ผลปาล์มสด (FFB)", price=4.80, currency="THB", unit="kg",
              price_type="farmgate", region="Southern Thailand", source="กรมการค้าภายใน", date=today,
              trend_direction="up", change_percent=2.1),
    ]
    for p in prices:
        session.add(p)
    session.commit()


def seed_articles(session: Session):
    if session.exec(select(Article)).first():
        return
    now = datetime.utcnow()
    articles = [
        Article(
            title="India Issues New Urea Tender for 1.5 Million Tonnes",
            title_th="อินเดียเปิดประมูลยูเรียใหม่ 1.5 ล้านตัน ราคา CFR สูงกว่าตลาดคาด",
            source="Reuters",
            url="https://www.reuters.com",
            published_at=now - timedelta(hours=2),
            language="en",
            country='["India","global"]',
            category='["fertilizer","tender","urea"]',
            keywords='["urea","India tender","MMTC","CFR","fertilizer price"]',
            summary_short="India's state buyer MMTC issued a new urea tender for 1.5 million tonnes. The CFR price accepted was higher than market expectations, signalling tight global urea supply.",
            summary_ai="อินเดียเปิดประมูลยูเรียรอบใหม่ ปริมาณ 1.5 ล้านตัน ราคา CFR ที่ได้รับสูงกว่าที่นักวิเคราะห์ส่วนใหญ่คาดไว้ สะท้อนถึงความต้องการยังคงแข็งแกร่งและอุปทานโลกที่ตึงตัว",
            impact_ai="ข้อเท็จจริง: อินเดียประมูลยูเรีย 1.5 ล้านตัน ราคา CFR สูงกว่าคาด\n\nผลกระทบที่เป็นไปได้: การประมูลครั้งนี้อาจตึงอุปทานยูเรียโลกในระยะสั้น ซึ่งอาจส่งผลต่อต้นทุนนำเข้าของไทยในงวดถัดไป\n\nความไม่แน่นอน: ผลกระทบต่อราคาไทยขึ้นอยู่กับค่าขนส่ง อัตราแลกเปลี่ยน และการจัดสรรซัพพลายเออร์",
            impact_thailand="ร้านปุ๋ยไทยควรระวังต้นทุนทดแทนยูเรียก่อนตัดสินใจลดราคา การประมูลอินเดียอาจทำให้ราคา FOB ตะวันออกกลางปรับสูงขึ้นในสัปดาห์หน้า",
            impact_south_thailand="ภาคใต้ไทยใช้ยูเรียหลักในสวนยางและปาล์ม หากราคานำเข้าปรับขึ้น ร้านปุ๋ยในพื้นที่ควรแจ้งลูกค้าเรื่องความผันผวนราคา",
            business_recommendation="1. ระวังการลดราคาเชิงรุกก่อนทราบต้นทุนทดแทน\n2. สื่อสารกับลูกค้าเรื่องความผันผวนราคาอย่างระมัดระวัง\n3. ติดตามข่าวจีนและอินเดียต่อเนื่อง",
            trust_score="high",
            is_pinned=True,
        ),
        Article(
            title="China Raises Urea Export Inspection Fees, Limiting Outflows",
            title_th="จีนขึ้นค่าตรวจสอบส่งออกยูเรีย สัญญาณจำกัดการส่งออก",
            source="Fertilizer Week",
            url="https://www.crugroup.com",
            published_at=now - timedelta(hours=18),
            language="en",
            country='["China","global"]',
            category='["fertilizer","policy","urea","export"]',
            keywords='["China urea","export restriction","inspection fee","fertilizer supply"]',
            summary_short="China has raised inspection fees on urea exports, a move seen as a soft restriction on outflows. Analysts expect reduced Chinese urea availability in global markets.",
            summary_ai="จีนขึ้นค่าตรวจสอบการส่งออกยูเรีย ซึ่งนักวิเคราะห์มองว่าเป็นการจำกัดการส่งออกทางอ้อม คาดว่าปริมาณยูเรียจีนในตลาดโลกจะลดลงในช่วงนี้",
            impact_thailand="หากจีนส่งออกยูเรียน้อยลง ผู้นำเข้าไทยอาจต้องหาซัพพลายเออร์สำรองจากตะวันออกกลาง ซึ่งมีต้นทุนค่าขนส่งสูงกว่า",
            trust_score="medium",
        ),
        Article(
            title="Southern Thailand Rubber Price Holds Steady After Rainfall Returns",
            title_th="ยางพาราภาคใต้ราคาทรงตัว หลังฝนกลับมาในพื้นที่",
            source="ข่าวยางพารา (RAOT)",
            url="https://www.rubber.co.th",
            published_at=now - timedelta(hours=5),
            language="th",
            country='["Thailand"]',
            category='["crop","rubber","southern_thailand","weather"]',
            keywords='["rubber","ยางพารา","ภาคใต้","ราคายาง","ฝน"]',
            summary_short="ราคายางพาราแผ่น RSS3 ภาคใต้ทรงตัวที่ 58-59 บาท/กก. หลังฝนกลับมาในพื้นที่ ปริมาณน้ำยางเริ่มเพิ่มขึ้น",
            summary_ai="ยางพาราราคาทรงตัวที่ 58-59 บาท/กก. หลังฝนกลับมาในภาคใต้ตอนล่าง ปริมาณน้ำยางเริ่มเพิ่มขึ้น คาดว่าความต้องการปุ๋ยสวนยางจะเพิ่มขึ้นในช่วง 4-6 สัปดาห์ข้างหน้า",
            impact_south_thailand="ฝนที่กลับมาในภาคใต้หมายความว่าเกษตรกรจะเริ่มกรีดยางได้มากขึ้น และมักจะใส่ปุ๋ยบำรุงหลังกรีด ร้านปุ๋ยในพื้นที่ควรเตรียมสต็อกปุ๋ยสำหรับสวนยาง",
            business_recommendation="เตรียมสต็อกปุ๋ยยูเรียและ NPK สำหรับฤดูกาลใส่ปุ๋ยยาง คาดว่าความต้องการจะเพิ่มขึ้นใน 4-6 สัปดาห์",
            trust_score="high",
        ),
        Article(
            title="Palm Oil Price Expected to Recover Next Month on Supply Tightening",
            title_th="ราคาปาล์มน้ำมันคาดว่าจะฟื้นตัวเดือนหน้า หลังอุปทานลดลง",
            source="กรมวิชาการเกษตร",
            url="https://www.doa.go.th",
            published_at=now - timedelta(hours=8),
            language="th",
            country='["Thailand","Malaysia","Indonesia"]',
            category='["crop","palm_oil","price"]',
            keywords='["palm oil","ปาล์มน้ำมัน","CPO","ราคาปาล์ม","อุปทาน"]',
            summary_short="ราคาปาล์มทะลายในไทยยังทรงตัวระดับต่ำ แต่คาดว่าจะปรับขึ้นหลังเดือนหน้า เนื่องจากผลผลิตปาล์มน้ำมันมาเลเซียและอินโดนีเซียเริ่มลดลง",
            summary_ai="ราคาปาล์มทะลายในไทยอยู่ที่ประมาณ 4.80 บาท/กก. คาดว่าจะปรับขึ้นในเดือนหน้าหลังอุปทานจากมาเลเซียและอินโดนีเซียลดลงตามฤดูกาล",
            impact_south_thailand="ราคาปาล์มที่ฟื้นตัวจะส่งผลดีต่อรายได้เกษตรกรในภาคใต้ ทำให้กำลังซื้อปุ๋ยอาจเพิ่มขึ้นในช่วงนั้น",
            trust_score="high",
        ),
        Article(
            title="Global DAP Prices Stable as Phosphate Supply Balances",
            title_th="ราคา DAP โลกทรงตัว อุปทานฟอสเฟตเสถียร",
            source="Reuters",
            url="https://www.reuters.com",
            published_at=now - timedelta(days=1),
            language="en",
            country='["global","Morocco","Saudi Arabia"]',
            category='["fertilizer","DAP","phosphate","price"]',
            keywords='["DAP","phosphate","fertilizer price","18-46-0"]',
            summary_short="Global DAP prices have stabilised around $610/tonne FOB as phosphate supply from Morocco and Saudi Arabia remains adequate. No major supply disruptions expected near-term.",
            summary_ai="ราคา DAP โลกทรงตัวที่ประมาณ 610 ดอลลาร์/ตัน FOB อุปทานฟอสเฟตจากโมร็อกโกและซาอุดีอาระเบียยังเพียงพอ ไม่มีสัญญาณขาดแคลนในระยะใกล้",
            impact_thailand="ราคา DAP ที่ทรงตัวช่วยให้ผู้นำเข้าไทยวางแผนต้นทุนได้ง่ายขึ้น เป็นโอกาสที่ดีในการรักษาราคาขายปลีก",
            trust_score="high",
        ),
    ]
    for a in articles:
        session.add(a)
    session.commit()


def run_seed():
    from app.database import create_db_and_tables
    create_db_and_tables()
    with Session(engine) as session:
        seed_topics(session)
        seed_sources(session)
        seed_prices(session)
        seed_articles(session)
    print("✅ Seed data loaded.")


if __name__ == "__main__":
    run_seed()
