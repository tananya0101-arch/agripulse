import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.database import create_db_and_tables
from app.seed import run_seed
from app.routers import articles, search, topics, prices, ai, admin

load_dotenv()

app = FastAPI(
    title="AgriPulse AI API",
    description="Agriculture and fertilizer market intelligence API for Thai businesses",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "https://agripulse-production-e978.up.railway.app",
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        # Vercel deployments
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router)
app.include_router(search.router)
app.include_router(topics.router)
app.include_router(prices.router)
app.include_router(ai.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    import sys
    try:
        create_db_and_tables()
        print("✅ DB tables ready.", flush=True)
    except Exception as e:
        print(f"❌ DB init error: {e}", file=sys.stderr, flush=True)
        raise
    try:
        run_seed()
    except Exception as e:
        print(f"❌ Seed error: {e}", file=sys.stderr, flush=True)
        raise
    import threading
    def _fetch():
        try:
            from app.fetcher import run_fetch
            print("🌾 Auto-fetching news on startup...", flush=True)
            result = run_fetch()
            print(f"✅ Auto-fetch done: {result['total_new']} new articles", flush=True)
        except Exception as e:
            print(f"⚠ Auto-fetch error: {e}", file=sys.stderr, flush=True)
    threading.Thread(target=_fetch, daemon=True).start()


@app.get("/")
def root():
    return {"status": "ok", "product": "AgriPulse AI API", "version": "0.1.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
