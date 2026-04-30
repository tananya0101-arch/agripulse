from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import Article
import json

router = APIRouter(prefix="/articles", tags=["articles"])


def article_to_dict(a: Article) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "title_th": a.title_th,
        "source": a.source,
        "url": a.url,
        "published_at": a.published_at.isoformat(),
        "language": a.language,
        "country": json.loads(a.country),
        "category": json.loads(a.category),
        "keywords": json.loads(a.keywords),
        "summary_short": a.summary_short,
        "summary_ai": a.summary_ai,
        "impact_ai": a.impact_ai,
        "impact_thailand": a.impact_thailand,
        "impact_south_thailand": a.impact_south_thailand,
        "business_recommendation": a.business_recommendation,
        "trust_score": a.trust_score,
        "license_status": a.license_status,
        "is_pinned": a.is_pinned,
        "created_at": a.created_at.isoformat(),
    }


@router.get("/")
def list_articles(
    limit: int = Query(default=20, le=50),
    offset: int = Query(default=0),
    topic: Optional[str] = Query(default=None),
    session: Session = Depends(get_session),
):
    query = select(Article).where(Article.is_approved == True)
    if topic:
        query = query.where(Article.keywords.contains(topic))
    query = query.order_by(Article.published_at.desc()).offset(offset).limit(limit)
    articles = session.exec(query).all()
    return [article_to_dict(a) for a in articles]


@router.get("/pinned")
def pinned_articles(session: Session = Depends(get_session)):
    articles = session.exec(
        select(Article).where(Article.is_pinned == True, Article.is_approved == True)
        .order_by(Article.published_at.desc())
        .limit(3)
    ).all()
    return [article_to_dict(a) for a in articles]


@router.get("/{article_id}")
def get_article(article_id: int, session: Session = Depends(get_session)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article_to_dict(article)
