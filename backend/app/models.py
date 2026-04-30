from typing import Optional, List
from datetime import datetime
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON


class Article(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    title_th: Optional[str] = None
    source: str
    url: str
    published_at: datetime
    language: str = "en"
    country: str = "[]"          # JSON array stored as string
    category: str = "[]"
    keywords: str = "[]"
    summary_short: Optional[str] = None
    summary_ai: Optional[str] = None
    impact_ai: Optional[str] = None
    impact_thailand: Optional[str] = None
    impact_south_thailand: Optional[str] = None
    business_recommendation: Optional[str] = None
    trust_score: str = "medium"  # high / medium / low
    license_status: str = "headline_and_link_only"
    is_pinned: bool = False
    is_approved: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Source(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    url: str
    feed_url: Optional[str] = None
    source_type: str   # news / price / government / industry
    access_method: str = "rss"
    trust_score: str = "medium"
    license_status: str = "headline_and_link_only"
    is_active: bool = True
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Topic(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    slug: str = Field(unique=True)
    name: str
    name_th: str
    synonyms: str = "[]"     # JSON array
    category: str            # crop / fertilizer / country / event
    follow_count: int = 0
    emoji: str = "🌿"


class Price(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    product: str
    product_th: str
    price: float
    currency: str = "USD"
    unit: str = "metric_ton"
    price_type: str          # FOB / CFR / farmgate / wholesale / auction
    region: str
    source: str
    date: str                # YYYY-MM-DD
    trend_direction: str = "flat"   # up / down / flat
    change_percent: float = 0.0
    notes: Optional[str] = None


class UserWatchlist(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str
    topic_slug: str
    alert_frequency: str = "daily"     # instant / daily / weekly / off
    min_alert_level: str = "medium"    # low / medium / high / critical
    language: str = "th"
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GeneratedContent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = "anonymous"
    article_id: Optional[int] = None
    content_type: str    # facebook_post / tiktok_script / line_oa / sales_talk / farmer / executive
    tone: str = "friendly"
    language: str = "th"
    body: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
