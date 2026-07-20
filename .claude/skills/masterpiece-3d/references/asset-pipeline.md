# Asset Pipeline — real brand assets, never recreated

A hand-drawn logo looks amateur (proven). Always extract the REAL mark and decor, then embed as data-URIs.
Requires `pdftoppm` (poppler) + Python `PIL`. Everything below produces transparent PNGs on the brand gold/colour.

## 1. Render the brand source at high DPI
From a brand-guidelines PDF (best source — official vector logo, gold-on-black):
```bash
pdftoppm -png -f <page> -l <page> -r 220 "brand.pdf" pg   # → pg-<page>.png ~5867×3300
```
From an image/logo file: just open it in PIL.

## 2. Black → transparent via luminance ramp (keeps gold gradient + soft edges)
Never threshold hard; ramp alpha from luminance so antialiased edges survive.
```python
from PIL import Image
def alpha_from_lum(im, lo=8, hi=64):
    L=im.convert("L")
    a=L.point(lambda x:0 if x<lo else (255 if x>hi else int((x-lo)/(hi-lo)*255)))
    r,g,b=im.convert("RGB").split()
    return Image.merge("RGBA",(r,g,b,a))
def tight(rgba,pad=30):
    bb=rgba.getbbox()
    if bb:
        l,t,r,b=bb
        rgba=rgba.crop((max(0,l-pad),max(0,t-pad),min(rgba.width,r+pad),min(rgba.height,b+pad)))
    return rgba
```

## 3. Crop the logo — split by alpha projection, NOT guessed fractions
Guessed fractional crops clip the mark (happened repeatedly). Crop a generous region that contains ONLY the
logo (exclude nearby body text), then split stacked elements (mark above wordmark) by finding the transparent
gap in the row-projection:
```python
lk=Image.open("lockup.png").convert("RGBA"); a=lk.split()[3]; px=a.load(); W,H=lk.size
rows=[sum(px[x,y] for x in range(0,W,3)) for y in range(H)]
thr=max(rows)*0.02; nz=[y for y in range(H) if rows[y]>=thr]
# group contiguous non-zero bands → [(top_y1,bot_y1),(top_y2,bot_y2)] = mark, wordmark
```
Same idea on column-projection to split an icon grid into individual glyphs.

## 4. ALWAYS verify each asset visually
After every crop, open the PNG and look. The bowtie logo clipped its wing 4 times before a clean extract — the
only reliable check is your own eyes, not the code. Re-crop until the full mark is present, centred, untruncated.

## 5. Optimize + embed as data-URIs (inject, don't paste)
Downscale (logo ≤ ~520px, decor ≤ ~720px, icons ≤ 200px), then inject base64 into HTML placeholders with a
tiny Python step (avoids pasting megabytes into the file):
```python
import base64,json
def du(p,m): return f"data:{m};base64,"+base64.b64encode(open(p,'rb').read()).decode()
html=open("source.html").read()
for token,path in {"__MARK__":"a_mark.png","__WORD__":"a_word.png"}.items():
    html=html.replace(token, du(path,"image/png"))
html=html.replace("__ICONS_JSON__", json.dumps([du(f,"image/png") for f in icon_files]))
open("final.html","w").write(html)
```
Keep the un-injected source (with `__TOKENS__`) as the editable master; re-inject on every change.

## 6. Fonts — inline a condensed display face
If the real brand face is licensed, fetch a libre proxy woff2 (Oswald ≈ Trade Gothic) once at build time and
embed as data-URI so the type character holds on any viewer:
```bash
curl -sL -o osw.woff2 "https://cdn.jsdelivr.net/npm/@fontsource/oswald/files/oswald-latin-600-normal.woff2"
```
```css
@font-face{font-family:'Display';font-weight:600;src:url(<data-uri>) format('woff2')}
```
Body stays a system grotesque (Helvetica/Arial) — ubiquitous, no embed needed.

## Budget
Total embedded assets ≤ ~700KB; whole file ≤ ~1.2MB. Downscale/optimize before embedding, not after.

## Using the mark in the page
- As an `<img>`/CSS background: real gold on transparent — sits seamlessly on the dark ground.
- As a metallic-sheen element: show the real image, overlay a moving white gradient masked by the same image
  (`-webkit-mask:url(mark)`, `mix-blend-mode:screen`, animate background-position) — a premium shimmer over real gold.
- Reflected in a mirror / behind glass: clip the real mark into an ellipse with `<clipPath>`, add a sweeping glint.
