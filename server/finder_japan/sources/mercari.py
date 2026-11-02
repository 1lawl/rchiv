"""Mercari JP search through mercapi (unofficial). Personal / prototype use only:
Mercari's terms forbid commercial use of its data without written permission."""

from __future__ import annotations

from mercapi import Mercapi
from mercapi.requests import SearchRequestData

_client: Mercapi | None = None


def _mercapi() -> Mercapi:
    global _client
    if _client is None:
        _client = Mercapi()
    return _client


async def search(query: str) -> list[dict]:
    res = await _mercapi().search(
        query,
        sort_by=SearchRequestData.SortBy.SORT_CREATED_TIME,
        sort_order=SearchRequestData.SortOrder.ORDER_DESC,
        status=[SearchRequestData.Status.STATUS_ON_SALE],
    )
    out = []
    for it in res.items:
        if it.is_no_price:
            continue
        out.append(
            {
                "id": f"mercari-{it.id_}",
                "title": it.name,
                "price_jpy": it.price,
                "market": "Mercari",
                "url": (
                    f"https://jp.mercari.com/shops/product/{it.id_}"
                    if it.item_type == "ITEM_TYPE_BEYOND"
                    else f"https://jp.mercari.com/item/{it.id_}"
                ),
                "image": it.thumbnails[0] if it.thumbnails else None,
                "created": int(it.created.timestamp()),
            }
        )
    return out
