#!/usr/bin/env python3
"""
build_recipe_card.py — render gorgeous, print-ready cocktail/food recipe cards as PDF.

Pure-Python (reportlab) vector rendering — NO browser, NO wkhtmltopdf, NO system
libraries. Produces identical premium output in Claude Code (macOS) and the
claude.ai sandbox (Linux). One card per recipe; each page is sized to its content
(two-pass measure → draw) so there is never dead space at the bottom.

Usage:  python3 build_recipe_card.py --input <bundle.json> --out <card.pdf>
"""
import argparse, io, json, os, sys

# ---- ensure reportlab -------------------------------------------------------
try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.colors import HexColor
    from reportlab.lib.utils import simpleSplit
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
except ImportError:
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "--quiet", "reportlab"], check=False)
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.colors import HexColor
    from reportlab.lib.utils import simpleSplit
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

# ---- palette ----------------------------------------------------------------
BG          = HexColor("#14110F")   # warm near-black
PANEL       = HexColor("#1E1A16")   # lifted panel
INK         = HexColor("#F4EEE3")   # off-white
INK_DIM     = HexColor("#C3B9A6")
INK_FAINT   = HexColor("#8C8273")
ACCENT      = HexColor("#C9A35B")   # warm gold
ACCENT_SOFT = HexColor("#E4CB8C")
HAIR        = HexColor("#3A332B")   # subtle divider
GOLD_DIM    = HexColor("#5C4C2C")
HERO_BG     = HexColor("#1B1712")

# ---- fonts (BUNDLED DejaVu first → correct metrics + Romanian, identical on every OS) --
_HERE = os.path.dirname(os.path.abspath(__file__))
_FD = os.path.join(os.path.dirname(_HERE), "assets", "fonts")
if not os.path.isdir(_FD):
    _FD = os.path.join(_HERE, "assets", "fonts")
def _f(n): return os.path.join(_FD, n)
SERIF_SETS = [
    (_f("DejaVuSerif.ttf"), _f("DejaVuSerif-Bold.ttf"), _f("DejaVuSerif-Italic.ttf"), _f("DejaVuSerif-BoldItalic.ttf")),
    ("/System/Library/Fonts/Supplemental/Georgia.ttf", "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
     "/System/Library/Fonts/Supplemental/Georgia Italic.ttf", "/System/Library/Fonts/Supplemental/Georgia Bold Italic.ttf"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
     "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSerif-BoldItalic.ttf"),
    ("/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
     "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf", "/usr/share/fonts/truetype/liberation/LiberationSerif-BoldItalic.ttf"),
]
SANS_SETS = [
    (_f("DejaVuSans.ttf"), _f("DejaVuSans-Bold.ttf"), _f("DejaVuSans-Oblique.ttf"), _f("DejaVuSans-BoldOblique.ttf")),
    ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
     "/System/Library/Fonts/Supplemental/Arial Italic.ttf", "/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf"),
    ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
     "/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans-BoldOblique.ttf"),
    ("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
     "/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf"),
]

def _register(prefix, sets, builtin):
    for reg, bold, ital, bi in sets:
        if os.path.exists(reg):
            try:
                pdfmetrics.registerFont(TTFont(prefix, reg))
                pdfmetrics.registerFont(TTFont(prefix + "-B", bold if os.path.exists(bold) else reg))
                pdfmetrics.registerFont(TTFont(prefix + "-I", ital if os.path.exists(ital) else reg))
                pdfmetrics.registerFont(TTFont(prefix + "-BI", bi if os.path.exists(bi) else (bold if os.path.exists(bold) else reg)))
                return {"r": prefix, "b": prefix + "-B", "i": prefix + "-I", "bi": prefix + "-BI"}
            except Exception:
                continue
    return {"r": builtin[0], "b": builtin[1], "i": builtin[2], "bi": builtin[3]}

SERIF = _register("Display", SERIF_SETS, ("Times-Roman", "Times-Bold", "Times-Italic", "Times-BoldItalic"))
SANS  = _register("Body", SANS_SETS, ("Helvetica", "Helvetica-Bold", "Helvetica-Oblique", "Helvetica-BoldOblique"))

# ---- geometry ---------------------------------------------------------------
PW = A4[0]            # fixed width (595pt); height is computed per card
PH = A4[1]            # current page height (set per card)
MEASURE_H = 4000.0    # tall scratch page for the measure pass
FRAME = 22
MX = 50
MTOP = 58
MBOT = 46
FOOTER_H = 78         # reserved band for the concept/story footer
MIN_H = 430           # don't make a card shorter than this

# ---- helpers ----------------------------------------------------------------
def trim(n):
    try:
        f = float(n)
        return str(int(f)) if f == int(f) else (("%g") % f)
    except Exception:
        return str(n)

def fmt_ingredient(ing):
    q = ing.get("qty", "")
    u = (ing.get("unit") or "").strip()
    name = ing.get("name", "")
    if u in ("ml", "cl", "oz", "g"):
        meas = f"{trim(q)}{u}"
    elif u == "dash":
        meas = f"{trim(q)} dash" + ("es" if str(q) not in ("1", "1.0") else "")
    elif u == "barspoon":
        meas = f"{trim(q)} bsp"
    elif u in ("each", "leaf"):
        meas = f"{trim(q)}×"
    elif u:
        meas = f"{trim(q)} {u}"
    else:
        meas = ""
    return (meas + " " + name).strip()

EXPAND = 1.30  # reportlab under-reports rendered TTF advance vs real engines; wrap with headroom
def wrapfit(text, font, size, maxw):
    return simpleSplit(str(text), font, size, max(10.0, maxw / EXPAND))

def label(c, x, y, text, size=8, color=ACCENT, tracking=2.2, font=None):
    t = c.beginText(x, y)
    t.setFont(font or SANS["b"], size)
    t.setFillColor(color)
    t.setCharSpace(tracking)
    t.textOut(text.upper())
    c.drawText(t)

def hairline(c, x1, x2, y, color=HAIR, w=0.6):
    c.setStrokeColor(color); c.setLineWidth(w)
    c.line(x1, y, x2, y)

def para(c, text, x, y, maxw, font, size, color, leading=None, align="l"):
    if not text:
        return y
    leading = leading or size * 1.34
    c.setFont(font, size); c.setFillColor(color)
    for line in wrapfit(text, font, size, maxw):
        if align == "r":
            c.drawRightString(x + maxw, y, line)
        elif align == "c":
            c.drawCentredString(x + maxw / 2.0, y, line)
        else:
            c.drawString(x, y, line)
        y -= leading
    return y

def section_label(c, x, x2, y, text):
    c.setFillColor(ACCENT)
    c.rect(x, y - 0.5, 14, 2.4, fill=1, stroke=0)
    label(c, x + 21, y, text, size=8.5, tracking=2.6)
    hairline(c, x, x2, y - 7, HAIR, 0.6)
    return y - 20

# ---- card -------------------------------------------------------------------
def render_card(c, r, meta, right_dec=None):
    """Draw one card on the current global PH. Returns (body_top, yl_end, yr_end)."""
    contentW = PW - 2 * MX

    c.setFillColor(BG); c.rect(0, 0, PW, PH, fill=1, stroke=0)
    band = min(250, PH * 0.42)
    c.setFillColor(HERO_BG); c.rect(0, PH - band, PW, band, fill=1, stroke=0)
    c.setStrokeColor(ACCENT); c.setLineWidth(0.8)
    c.rect(FRAME, FRAME, PW - 2 * FRAME, PH - 2 * FRAME, fill=0, stroke=1)
    c.setStrokeColor(GOLD_DIM); c.setLineWidth(0.4)
    c.rect(FRAME + 3, FRAME + 3, PW - 2 * (FRAME + 3), PH - 2 * (FRAME + 3), fill=0, stroke=1)

    y = PH - MTOP

    venue = (meta.get("location") or "").strip()
    if venue:
        label(c, MX, y, venue, size=7.5, color=INK_FAINT, tracking=3.0)
        y -= 18

    if r.get("hero_brand"):
        label(c, MX, y, r["hero_brand"], size=10.5, color=ACCENT, tracking=3.2)
        y -= 26

    name = (r.get("name") or "Untitled").upper()
    size = 33
    while size > 18 and max((pdfmetrics.stringWidth(w, SERIF["b"], size) for w in name.split()), default=0) * EXPAND > contentW:
        size -= 1
    for line in wrapfit(name, SERIF["b"], size, contentW):
        c.setFont(SERIF["b"], size); c.setFillColor(INK)
        c.drawString(MX, y, line)
        y -= size * 1.05
    y -= 6

    tag = r.get("flavour_tag") or ""
    chips = [t.strip() for t in tag.replace("/", "·").split("·") if t.strip()]
    if chips:
        cx = MX
        for ch in chips:
            txt = ch.upper()
            c.setFont(SANS["b"], 7.5)
            tw = pdfmetrics.stringWidth(txt, SANS["b"], 7.5) * EXPAND + 2.6 * max(len(txt) - 1, 0)
            w = tw + 16
            c.setStrokeColor(ACCENT); c.setLineWidth(0.7)
            c.roundRect(cx, y - 11, w, 16, 8, fill=0, stroke=1)
            tt = c.beginText(cx + 8, y - 7)
            tt.setFont(SANS["b"], 7.5); tt.setFillColor(ACCENT_SOFT); tt.setCharSpace(2.6)
            tt.textOut(txt); c.drawText(tt)
            cx += w + 7
        y -= 24
    else:
        y -= 4

    hairline(c, MX, PW - MX, y, ACCENT, 1.0)
    hairline(c, MX, PW - MX, y - 3, GOLD_DIM, 0.4)
    y -= 20

    colw = contentW / 2.0
    def meta_cell(x, lab, val):
        label(c, x, y, lab, size=7.5, tracking=2.4)
        para(c, val or "—", x, y - 13, colw - 12, SANS["r"], 10, INK, leading=12.5)
    meta_cell(MX, "Glass", r.get("glass"))
    meta_cell(MX + colw, "Ice", r.get("ice"))
    y -= 34
    if r.get("garnish"):
        label(c, MX, y, "Garnish", size=7.5, tracking=2.4)
        y = para(c, r["garnish"], MX, y - 13, contentW, SANS["r"], 10, INK, leading=13) - 8

    body_top = y - 6

    gutter = 26
    LW = contentW * 0.53
    RW = contentW - LW - gutter
    lx = MX
    rx = MX + LW + gutter

    # right-column panel — sized to its content when right_dec is known (real pass)
    if right_dec is not None:
        pb = body_top - right_dec - 6
        c.setFillColor(PANEL)
        c.roundRect(rx - 12, pb, RW + 22, body_top - pb + 10, 7, fill=1, stroke=0)

    # LEFT: ingredients + method
    yl = body_top
    yl = section_label(c, lx, lx + LW, yl, "Ingredients")
    hero = (r.get("hero_brand") or "").lower()
    hero_word = hero.split()[0] if hero else ""
    for ing in r.get("ingredients", []):
        if ing.get("is_garnish"):
            continue
        line = fmt_ingredient(ing)
        is_hero = bool(hero_word) and hero_word in ing.get("name", "").lower()
        yl = para(c, line, lx, yl, LW, SANS["b"] if is_hero else SANS["r"], 10.5,
                  ACCENT_SOFT if is_hero else INK, leading=15.5)
    yl -= 8
    yl = section_label(c, lx, lx + LW, yl, "Method")
    for i, step in enumerate(r.get("method", []), 1):
        cyc = yl + 3.2
        c.setStrokeColor(ACCENT); c.setLineWidth(0.7)
        c.circle(lx + 6.5, cyc, 7.2, fill=0, stroke=1)
        c.setFillColor(ACCENT); c.setFont(SANS["b"], 7.5)
        c.drawCentredString(lx + 6.5, cyc - 2.7, str(i))
        yl = para(c, step, lx + 21, yl, LW - 21, SANS["r"], 9.8, INK_DIM, leading=13.5) - 5

    # RIGHT: menu description, homemade, food pairing
    yr = body_top
    if r.get("menu_description"):
        yr = section_label(c, rx, rx + RW, yr, "Menu Description")
        lines = wrapfit(r["menu_description"], SERIF["i"], 10.5, RW - 24)
        rule_h = len(lines) * 15
        c.setFillColor(ACCENT); c.rect(rx, yr - rule_h + 11, 2, rule_h, fill=1, stroke=0)
        yy = yr
        c.setFont(SERIF["i"], 10.5); c.setFillColor(INK)
        for ln in lines:
            c.drawString(rx + 11, yy, ln); yy -= 15
        yr = yy - 10

    hms = r.get("homemades") or []
    if hms:
        yr = section_label(c, rx, rx + RW, yr, "Homemade")
        for hm in hms:
            yr = para(c, "• " + hm.get("name", ""), rx, yr, RW - 14, SANS["b"], 9.5, ACCENT_SOFT, leading=13)
            if hm.get("method"):
                yr = para(c, hm["method"], rx, yr, RW - 14, SANS["r"], 8.8, INK_DIM, leading=12) - 4

    if r.get("food_pairing"):
        yr = section_label(c, rx, rx + RW, yr, "Food Pairing")
        yr = para(c, r["food_pairing"], rx, yr, RW - 14, SERIF["i"], 9.8, INK_DIM, leading=13.5)

    # FOOTER: concept / story — anchored in the reserved bottom band
    hairline(c, MX, PW - MX, MBOT + 60, HAIR, 0.6)
    fy = MBOT + 46
    story = r.get("story") or r.get("concept") or ""
    if story:
        c.setFont(SERIF["i"], 9); c.setFillColor(INK_FAINT)
        yy = fy
        for ln in wrapfit(story, SERIF["i"], 9, contentW * 0.62)[:3]:
            c.drawString(MX, yy, ln); yy -= 12.5
    right_mark = " · ".join(x for x in [r.get("family", ""), (meta.get("date") or "")] if x)
    if right_mark:
        c.setFont(SANS["r"], 7); c.setFillColor(INK_FAINT)
        c.drawRightString(PW - MX, fy, right_mark.upper()[:48])

    return (body_top, yl, yr)

# ---- main -------------------------------------------------------------------
def main():
    global PH
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    with open(a.input, encoding="utf-8") as f:
        bundle = json.load(f)
    meta = bundle.get("meta", {})
    recipes = bundle.get("recipes", [])
    if not recipes:
        print("No recipes in bundle.", file=sys.stderr); sys.exit(1)

    out = canvas.Canvas(a.out, pagesize=(PW, PH))
    out.setTitle(meta.get("location", "Recipe Cards"))
    for r in recipes:
        # PASS 1 — measure on a tall scratch page
        PH = MEASURE_H
        scratch = canvas.Canvas(io.BytesIO(), pagesize=(PW, PH))
        body_top, yl, yr = render_card(scratch, r, meta, right_dec=None)
        hdr = (PH - MTOP) - body_top
        left_dec = body_top - yl
        right_dec = body_top - yr
        page_h = MTOP + hdr + max(left_dec, right_dec) + FOOTER_H + MBOT
        page_h = max(MIN_H, round(page_h))
        # PASS 2 — draw for real at the fitted height
        PH = page_h
        out.setPageSize((PW, PH))
        render_card(out, r, meta, right_dec=right_dec)
        out.showPage()
    out.save()
    print(f"Wrote {a.out}: {len(recipes)} card(s)  [engine: reportlab, fitted height, fonts: {SERIF['r']}/{SANS['r']}]")

if __name__ == "__main__":
    main()
