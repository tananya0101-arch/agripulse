from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import Article
from app.routers.articles import article_to_dict
import json

router = APIRouter(prefix="/search", tags=["search"])

# Thai-English synonym map for MVP topics
SYNONYMS: dict[str, list[str]] = {
    "ยูเรีย": ["urea", "46-0-0", "nitrogen"],
    "urea": ["ยูเรีย", "46-0-0", "nitrogen"],
    "โพแทช": ["potash", "mop", "potassium"],
    "potash": ["โพแทช", "mop"],
    "mop": ["โพแทช", "potash"],
    "ฟอสเฟต": ["phosphate", "dap", "map"],
    "dap": ["ฟอสเฟต", "phosphate", "18-46-0"],
    "ยางพารา": ["rubber", "latex", "natural rubber"],
    "rubber": ["ยางพารา", "latex"],
    "ปาล์มน้ำมัน": ["palm oil", "cpo", "palm"],
    "palm": ["ปาล์มน้ำมัน", "cpo"],
    "ทุเรียน": ["durian"],
    "durian": ["ทุเรียน"],
    "ข้าว": ["rice", "jasmine rice"],
    "rice": ["ข้าว"],
    "อินเดีย": ["india", "mmtc"],
    "india": ["อินเดีย", "mmtc"],
    "จีน": ["china", "chinese"],
    "china": ["จีน"],
}


def expand_query(q: str) -> list[str]:
    lower = q.lower().strip()
    terms = [lower]
    if lower in SYNONYMS:
        terms.extend(SYNONYMS[lower])
    return list(set(terms))


@router.get("/")
def search(
    q: str = Query(description="Search query (Thai or English)"),
    limit: int = Query(default=15, le=30),
    session: Session = Depends(get_session),
):
    terms = expand_query(q)
    seen_ids: set[int] = set()
    results = []

    for term in terms:
        articles = session.exec(
            select(Article)
            .where(Article.is_approved == True)
            .where(
                Article.title.contains(term)
                | Article.title_th.contains(term)
                | Article.keywords.contains(term)
                | Article.category.contains(term)
                | Article.summary_short.contains(term)
            )
            .order_by(Article.published_at.desc())
            .limit(limit)
        ).all()
        for a in articles:
            if a.id not in seen_ids:
                seen_ids.add(a.id)
                results.append(article_to_dict(a))

    results.sort(key=lambda x: x["published_at"], reverse=True)
    return {
        "query": q,
        "expanded_terms": terms,
        "count": len(results),
        "results": results[:limit],
    }
