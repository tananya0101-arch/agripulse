from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlmodel import Session, select
from app.database import get_session
from app.models import Article, Source
from app.routers.articles import article_to_dict

router = APIRouter(prefix="/admin", tags=["admin"])


class ArticleUpdate(BaseModel):
    is_approved: Optional[bool] = None
    is_pinned: Optional[bool] = None
    summary_ai: Optional[str] = None
    trust_score: Optional[str] = None
    title_th: Optional[str] = None


class SourceCreate(BaseModel):
    name: str
    url: str
    feed_url: Optional[str] = None
    source_type: str
    access_method: str = "rss"
    trust_score: str = "medium"
    license_status: str = "headline_and_link_only"
    notes: Optional[str] = None


@router.get("/articles/queue")
def article_queue(session: Session = Depends(get_session)):
    articles = session.exec(
        select(Article).order_by(Article.created_at.desc()).limit(30)
    ).all()
    return [article_to_dict(a) for a in articles]


@router.patch("/articles/{article_id}")
def update_article(article_id: int, update: ArticleUpdate, session: Session = Depends(get_session)):
    article = session.get(Article, article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if update.is_approved is not None:
        article.is_approved = update.is_approved
    if update.is_pinned is not None:
        article.is_pinned = update.is_pinned
    if update.summary_ai is not None:
        article.summary_ai = update.summary_ai
    if update.trust_score is not None:
        article.trust_score = update.trust_score
    if update.title_th is not None:
        article.title_th = update.title_th
    session.add(article)
    session.commit()
    session.refresh(article)
    return article_to_dict(article)


@router.get("/sources")
def list_sources(session: Session = Depends(get_session)):
    sources = session.exec(select(Source)).all()
    return [
        {"id": s.id, "name": s.name, "url": s.url, "source_type": s.source_type,
         "trust_score": s.trust_score, "license_status": s.license_status,
         "is_active": s.is_active, "notes": s.notes}
        for s in sources
    ]


@router.post("/sources")
def create_source(data: SourceCreate, session: Session = Depends(get_session)):
    source = Source(**data.model_dump())
    session.add(source)
    session.commit()
    session.refresh(source)
    return {"id": source.id, "name": source.name}


@router.patch("/sources/{source_id}/toggle")
def toggle_source(source_id: int, session: Session = Depends(get_session)):
    source = session.get(Source, source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    source.is_active = not source.is_active
    session.add(source)
    session.commit()
    return {"id": source.id, "is_active": source.is_active}


@router.post("/fetch-news")
def fetch_news(background_tasks: BackgroundTasks):
    """Trigger a Google News RSS fetch for all MVP topics."""
    from app.fetcher import run_fetch
    background_tasks.add_task(run_fetch)
    return {"status": "started", "message": "Fetching news in background. Check /articles/ in 30 seconds."}


@router.post("/fetch-news/sync")
def fetch_news_sync():
    """Fetch news synchronously and return results immediately."""
    from app.fetcher import run_fetch
    result = run_fetch()
    return {"status": "done", "total_new": result["total_new"], "by_topic": result["by_topic"]}
