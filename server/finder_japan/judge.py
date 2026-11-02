"""The real-vs-fake brand filter, rebuilt from jpbot's rules.

A listing is judged on its title:
  * hidden    - contains a word from exclude.txt
  * genuine   - the brand appears as a whole word, used as the brand
  * doubtful  - the brand only appears as a style reference (風, 系, っぽ, ライク...)
                or a "for fans of" line (好きな方...), or doesn't appear at all

In jpbot's 2026-10-16 run this flagged 3,315 of 6,598 listings, so this filter
is the product. Tests live in server/tests/test_judge.py.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

from .brands import Brand

# Words right after the brand that mean "in the style of", not "made by".
STYLE_WORDS = ["風", "系", "っぽい", "っぽ", "ぽい", "みたい", "ライク", "テイスト", "タイプ", "調"]
# Words that mean "for fans of <brand>".
FAN_WORDS = ["好きな方", "好きな人", "好きにも", "好きに", "好き", "ファン", "お好きな"]

STYLE_LABEL = {w: f"Style reference ({w})" for w in STYLE_WORDS}
FAN_LABEL = {w: f"For fans of ({w})" for w in FAN_WORDS}

_KATAKANA = re.compile(r"[ァ-ヺー]")
_GAP = re.compile(r"^[\s　・/()（）\[\]【】「」『』\"'-]*")


@dataclass
class Verdict:
    hidden: bool = False
    doubtful: bool = False
    reason: str | None = None


def normalize(s: str) -> str:
    # Full-width letters to half-width, unify case. Keeps Japanese as-is.
    return unicodedata.normalize("NFKC", s).lower()


def _is_word_char(ch: str) -> bool:
    return ch.isascii() and (ch.isalnum() or ch in "_&")


def _boundary_ok(term: str, before: str, after: str) -> bool:
    """Whole-word check. ASCII terms need non-letters around them; katakana terms
    need non-katakana around them (so キャピタル doesn't match inside キャピタルゲイン)."""
    if term[0].isascii() and before and _is_word_char(before):
        return False
    if term[-1].isascii() and after and _is_word_char(after):
        return False
    if _KATAKANA.match(term[0]) and before and _KATAKANA.match(before):
        return False
    if _KATAKANA.match(term[-1]) and after and _KATAKANA.match(after):
        return False
    return True


def judge(title: str, brand: Brand, exclude: list[str] = ()) -> Verdict:
    t = normalize(title)
    for w in exclude:
        if normalize(w) in t:
            return Verdict(hidden=True, reason=f"Excluded word ({w})")

    found_genuine = False
    flag: str | None = None
    for term in sorted(brand.terms, key=len, reverse=True):
        n = normalize(term)
        start = 0
        while (i := t.find(n, start)) != -1:
            start = i + 1
            before = t[i - 1] if i > 0 else ""
            rest = t[i + len(n):]
            after_gap = _GAP.sub("", rest, count=1)
            # Style / fan words win even when glued to the name (キャピタル風, キャピタルライク).
            hit = next((w for w in STYLE_WORDS if rest.startswith(w) or after_gap.startswith(w)), None)
            if hit:
                flag = flag or STYLE_LABEL[hit]
                continue
            hit = next((w for w in FAN_WORDS if rest.startswith(w) or after_gap.startswith(w)), None)
            if hit:
                flag = flag or FAN_LABEL[hit]
                continue
            if _boundary_ok(n, before, rest[:1]):
                found_genuine = True

    if found_genuine:
        return Verdict()
    if flag:
        return Verdict(doubtful=True, reason=flag)
    return Verdict(doubtful=True, reason="Brand not in title")
