"""Run with:  python -m pytest server/tests   (or just: python server/tests/test_judge.py)"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from finder_japan.brands import parse_brands, parse_exclude  # noqa: E402
from finder_japan.judge import judge  # noqa: E402

BRANDS = {b.name: b for b in parse_brands(
    """
    # comment
    fav: IfSixWasNine | イフシックスワズナイン | also: IFSIXWASNINE, if six was nine
    Kapital | キャピタル | also: KAPITAL
    off: Kmrii | ケムリ
    14th Addiction | フォーティーンスアディクション | also: 14TH ADDICTION
    """
)}
EX = parse_exclude("ステッカー\n# note\n")


def test_parse():
    assert BRANDS["IfSixWasNine"].fav and BRANDS["Kmrii"].off
    assert BRANDS["Kapital"].jp == ["キャピタル"]
    assert "if six was nine" in BRANDS["IfSixWasNine"].aliases


def test_genuine():
    assert not judge("IFSIXWASNINE フレアデニム 2", BRANDS["IfSixWasNine"]).doubtful
    assert not judge("ＫＡＰＩＴＡＬ パッチワークデニム", BRANDS["Kapital"]).doubtful  # full-width letters
    assert not judge("【キャピタル】デニム", BRANDS["Kapital"]).doubtful
    assert not judge("14th Addiction ボンバージャケット", BRANDS["14th Addiction"]).doubtful


def test_style_and_fan_words():
    v = judge("IFSIXWASNINE風 フレアパンツ", BRANDS["IfSixWasNine"])
    assert v.doubtful and "風" in v.reason
    v = judge("キャピタル系 デニム", BRANDS["Kapital"])
    assert v.doubtful and "系" in v.reason
    v = judge("14th Addiction好きな方に ジャケット", BRANDS["14th Addiction"])
    assert v.doubtful and "好きな方" in v.reason
    v = judge("キャピタルライク ボロデニム", BRANDS["Kapital"])
    assert v.doubtful and "ライク" in v.reason


def test_real_mention_beats_style_mention():
    # Genuine piece that also says "in the KAPITAL style" stays genuine.
    assert not judge("KAPITAL デニム キャピタル風の加工", BRANDS["Kapital"]).doubtful


def test_whole_word():
    v = judge("キャピタルゲイン 本", BRANDS["Kapital"])
    assert v.doubtful and v.reason == "Brand not in title"
    v = judge("kapitalism tee", BRANDS["Kapital"])
    assert v.doubtful


def test_exclude():
    assert judge("KAPITAL ステッカー", BRANDS["Kapital"], EX).hidden


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("ok", name)
