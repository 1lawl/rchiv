"""Finder Japan service: the brain of jpbot, as a tiny web API the rChiv app calls.

Run it (from the server/ folder):
    pip install -r requirements.txt
    uvicorn finder_japan.app:app --host 0.0.0.0 --port 8787

Endpoints
    GET /health
    GET /brands                    -> brands from brands.txt (paused ones left out)
    GET /search?brands=A,B         -> newest listings for those brands, each judged

Results are cached per brand (not per user) for CACHE_SECONDS, so the cost grows
with the number of brands, not the number of users. That is the "one shared
per-brand index" idea from the concept doc.
"""

from __future__ import annotations

import asyncio
import os
import time
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .brands import Brand, load
from .judge import judge
from .sources import mercari

HERE = Path(__file__).resolve().parent.parent  # server/
CACHE_SECONDS = int(os.environ.get("FINDER_CACHE_SECONDS", "300"))

app = FastAPI(title="rChiv Finder Japan")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["GET"], allow_headers=["*"])

# Pluggable so tests (and later Yahoo Auctions / Rakuma / proxy-partner feeds) can swap in.
SOURCES = {"Mercari": mercari.search}

_cache: dict[str, tuple[float, list[dict]]] = {}


def _brands() -> tuple[dict[str, Brand], list[str]]:
    brands, exclude = load(HERE)  # re-read each call so edits to brands.txt apply instantly
    return {b.name: b for b in brands if not b.off}, exclude


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/brands")
def brands():
    by_name, _ = _brands()
    return {"brands": [b.to_json() for b in by_name.values()]}


async def _fetch_brand(brand: Brand) -> list[dict]:
    hit = _cache.get(brand.name)
    if hit and time.time() - hit[0] < CACHE_SECONDS:
        return hit[1]
    rows: list[dict] = []
    for market, fn in SOURCES.items():
        try:
            rows += await fn(brand.query)
        except Exception as e:  # one market failing shouldn't sink the rest
            print(f"[finder] {market} failed for {brand.name}: {e}")
    _cache[brand.name] = (time.time(), rows)
    return rows


@app.get("/search")
async def search(brands: str = Query(..., description="Comma-separated brand names from /brands")):
    by_name, exclude = _brands()
    wanted = [by_name[n.strip()] for n in brands.split(",") if n.strip() in by_name]
    if not wanted:
        raise HTTPException(400, "None of those brands are in brands.txt")

    batches = await asyncio.gather(*(_fetch_brand(b) for b in wanted))
    listings, seen = [], set()
    for brand, rows in zip(wanted, batches):
        for r in rows:
            if r["id"] in seen:
                continue
            v = judge(r["title"], brand, exclude)
            if v.hidden:
                continue
            seen.add(r["id"])
            listings.append({**r, "brand": brand.name, "doubtful": v.doubtful, "reason": v.reason})

    listings.sort(key=lambda r: r["created"], reverse=True)
    return {"fetched_at": int(time.time()), "listings": listings[:200]}
