"""
News fetcher — pulls from Google News RSS (free, no API key).
Supports Thai and English queries for all MVP topics.
"""
import json
import hashlib
import feedparser
import httpx
from datetime import datetime, timezone
from sqlmodel import Session, select
from app.database import engine
from app.models import Article

# Google News RSS — free, no key needed, Thai language supported
GNEWS_URL = "https://news.google.com/rss/search?q={query}&hl=th&gl=TH&ceid=TH:th"
GNEWS_EN_URL = "https://news.google.com/rss/search?q={query}&hl=en&gl=US&ceid=US:en"

MVP_TOPICS = [
    # Thai queries → Thai news
    {"query": "ยางพารา ราคา",          "tags": ["rubber", "ยางพารา", "crop"],       "lang": "th"},
    {"query": "ปาล์มน้ำมัน ราคา",       "tags": ["palm_oil", "ปาล์ม", "crop"],       "lang": "th"},
    {"query": "ทุเรียน ส่งออก ราคา",    "tags": ["durian", "ทุเรียน", "crop"],       "lang": "th"},
    {"query": "ข้าว ราคา ไทย",          "tags": ["rice", "ข้าว", "crop"],            "lang": "th"},
    {"query": "ปุ๋ย ราคา ไทย",          "tags": ["fertilizer", "ปุ๋ย"],              "lang": "th"},
    {"query": "ยูเรีย ปุ๋ย",            "tags": ["urea", "ยูเรีย", "fertilizer"],    "lang": "th"},
    {"query": "เกษตร ราคา สินค้า",      "tags": ["agriculture", "เกษตร"],            "lang": "th"},
    # English queries → international fertilizer news
    {"query": "urea fertilizer price",  "tags": ["urea", "fertilizer", "price"],     "lang": "en"},
    {"query": "DAP fertilizer market",  "tags": ["DAP", "fertilizer", "price"],      "lang": "en"},
    {"query": "India urea tender",       "tags": ["urea", "india-tender", "India"],   "lang": "en"},
    {"query": "China fertilizer export", "tags": ["china-export", "China", "fertilizer"], "lang": "en"},
    {"query": "MOP potash price",        "tags": ["MOP", "potash", "fertilizer"],     "lang": "en"},
    {"query": "palm oil price market",   "tags": ["palm_oil", "price"],               "lang": "en"},
    {"query": "rubber natural latex price", "tags": ["rubber", "latex", "price"],     "lang": "en"},
    {"query": "Thailand agriculture news",  "tags": ["Thailand", "agriculture"],      "lang": "en"},
]


def url_to_id(url: str) -> str:
    return hashlib.md5(url.encode()).hexdigest()[:16]


def parse_date(entry) -> datetime:
    try:
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc).replace(tzinfo=None)
    except Exception:
        pass
    return datetime.utcnow()


def detect_trust(source: str) -> str:
    high = ["reuters", "bloomberg", "financial times", "กรมวิชาการ", "กรมส่งเสริม",
            "ธนาคารแห่งประเทศไทย", "สำนักงานเศรษฐกิจ", "icis", "argus", "bbc", "the nation"]
    low = ["blogspot", "wordpress", "reddit", "pantip", "facebook"]
    src = source.lower()
    if any(h in src for h in high):
        return "high"
    if any(l in src for l in low):
        return "low"
    return "medium"


def fetch_topic(topic: dict, max_articles: int = 8) -> list[dict]:
    query = topic["query"]
    lang = topic.get("lang", "th")
    url = (GNEWS_URL if lang == "th" else GNEWS_EN_URL).format(
        query=httpx.URL(query).raw_path.decode() if False else query.replace(" ", "+")
    )

    try:
        feed = feedparser.parse(url)
    except Exception as e:
        print(f"  ⚠ fetch error for '{query}': {e}")
        return []

    results = []
    for entry in feed.entries[:max_articles]:
        title = entry.get("title", "").strip()
        link = entry.get("link", "").strip()
        source_tag = entry.get("source", {})
        source_name = source_tag.get("title", "") if isinstance(source_tag, dict) else str(source_tag)
        if not source_name:
            # Try to parse from title (Google News format: "Title - Source Name")
            if " - " in title:
                parts = title.rsplit(" - ", 1)
                source_name = parts[-1].strip()
                title = parts[0].strip()
        if not title or not link:
            continue

        results.append({
            "title": title,
            "url": link,
            "source": source_name or "Google News",
            "published_at": parse_date(entry),
            "language": lang,
            "tags": topic["tags"],
            "trust_score": detect_trust(source_name),
        })
    return results


def save_articles(articles_data: list[dict], session: Session) -> int:
    saved = 0
    for data in articles_data:
        # Dedup by URL hash
        url_hash = url_to_id(data["url"])
        existing = session.exec(
            select(Article).where(Article.url.contains(url_hash))
        ).first()
        # Also check exact URL
        existing = existing or session.exec(
            select(Article).where(Article.url == data["url"])
        ).first()
        if existing:
            continue

        tags = data["tags"]
        article = Article(
            title=data["title"],
            title_th=data["title"] if data["language"] == "th" else None,
            source=data["source"],
            url=data["url"],
            published_at=data["published_at"],
            language=data["language"],
            country=json.dumps(["Thailand"] if data["language"] == "th" else ["global"]),
            category=json.dumps(tags[:3]),
            keywords=json.dumps(tags),
            summary_short=None,
            summary_ai=None,
            trust_score=data["trust_score"],
            license_status="headline_and_link_only",
            is_approved=True,
        )
        session.add(article)
        saved += 1

    session.commit()
    return saved


def run_fetch(topics=None, max_per_topic: int = 8) -> dict:
    topics = topics or MVP_TOPICS
    total_new = 0
    results = {}

    with Session(engine) as session:
        for topic in topics:
            q = topic["query"]
            print(f"  Fetching: {q}")
            articles = fetch_topic(topic, max_per_topic)
            saved = save_articles(articles, session)
            total_new += saved
            results[q] = {"fetched": len(articles), "saved": saved}
            print(f"    → {len(articles)} fetched, {saved} new saved")

    return {"total_new": total_new, "by_topic": results}


if __name__ == "__main__":
    from app.database import create_db_and_tables
    create_db_and_tables()
    print("🌾 Fetching news from Google News RSS...")
    result = run_fetch()
    print(f"\n✅ Done — {result['total_new']} new articles saved.")
