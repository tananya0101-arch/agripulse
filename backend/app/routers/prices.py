from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.database import get_session
from app.models import Price

router = APIRouter(prefix="/prices", tags=["prices"])


@router.get("/")
def list_prices(session: Session = Depends(get_session)):
    prices = session.exec(
        select(Price).order_by(Price.date.desc())
    ).all()
    return [
        {
            "id": p.id,
            "product": p.product,
            "product_th": p.product_th,
            "price": p.price,
            "currency": p.currency,
            "unit": p.unit,
            "price_type": p.price_type,
            "region": p.region,
            "source": p.source,
            "date": p.date,
            "trend_direction": p.trend_direction,
            "change_percent": p.change_percent,
            "notes": p.notes,
        }
        for p in prices
    ]
