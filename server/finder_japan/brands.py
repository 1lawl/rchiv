"""Reads brands.txt (the same format as jpbot) and exclude.txt."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path


@dataclass
class Brand:
    name: str
    jp: list[str] = field(default_factory=list)
    aliases: list[str] = field(default_factory=list)
    fav: bool = False
    off: bool = False

    @property
    def terms(self) -> list[str]:
        """Every spelling we look for in a listing title."""
        seen: list[str] = []
        for t in [self.name, *self.jp, *self.aliases]:
            if t and t.lower() not in (s.lower() for s in seen):
                seen.append(t)
        return seen

    @property
    def query(self) -> str:
        """What we type into the marketplace search box. Japanese name first: it finds the most."""
        return self.jp[0] if self.jp else self.name

    def to_json(self) -> dict:
        return {"name": self.name, "jp": self.jp, "aliases": self.aliases, "fav": self.fav}


def parse_brands(text: str) -> list[Brand]:
    brands: list[Brand] = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        fav = off = False
        low = line.lower()
        if low.startswith("off:"):
            off, line = True, line[4:].strip()
        elif low.startswith("fav:"):
            fav, line = True, line[4:].strip()
        parts = [p.strip() for p in line.split("|") if p.strip()]
        if not parts:
            continue
        b = Brand(name=parts[0], fav=fav, off=off)
        for p in parts[1:]:
            if p.lower().startswith("also:"):
                b.aliases += [a.strip() for a in p[5:].split(",") if a.strip()]
            else:
                b.jp.append(p)
        brands.append(b)
    return brands


def parse_exclude(text: str) -> list[str]:
    return [w.strip() for w in text.splitlines() if w.strip() and not w.strip().startswith("#")]


def load(dir_: Path) -> tuple[list[Brand], list[str]]:
    brands = parse_brands((dir_ / "brands.txt").read_text(encoding="utf-8"))
    ex_path = dir_ / "exclude.txt"
    exclude = parse_exclude(ex_path.read_text(encoding="utf-8")) if ex_path.exists() else []
    return brands, exclude
