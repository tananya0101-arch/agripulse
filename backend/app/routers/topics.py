from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Topic
import json

router = APIRouter(prefix="/topics", tags=["topics"])


@router.get("/")
def list_topics(session: Session = Depends(get_session)):
    topics = session.exec(select(Topic)).all()
    return [
        {
            "id": t.id,
            "slug": t.slug,
            "name": t.name,
            "name_th": t.name_th,
            "synonyms": json.loads(t.synonyms),
            "category": t.category,
            "follow_count": t.follow_count,
            "emoji": t.emoji,
        }
        for t in topics
    ]


@router.get("/{slug}")
def get_topic(slug: str, session: Session = Depends(get_session)):
    topic = session.exec(select(Topic).where(Topic.slug == slug)).first()
    if not topic:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Topic not found")
    return {
        "id": topic.id,
        "slug": topic.slug,
        "name": topic.name,
        "name_th": topic.name_th,
        "synonyms": json.loads(topic.synonyms),
        "category": topic.category,
        "follow_count": topic.follow_count,
        "emoji": topic.emoji,
    }
