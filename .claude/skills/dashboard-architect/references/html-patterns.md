# HTML Patterns — fișier self-contained, interactiv, themeable

*Mecanismul print/PDF e VERIFICAT [MDN]. Restul = pattern-uri recomandate din practică (alegerea
charting-ului a fost declarată „gap" în research — recomandarea de mai jos vine din portabilitate + control print).*

## 1. Self-contained: zero rețea
Tot inline: `<style>` în `<head>`, `<script>` la final, fonturi cu **fallback de sistem**, grafice
generate din date inline. Fără CDN, fără Google Fonts live, fără API. Rulează offline, din email, de pe
stick. (Pentru un font de brand obligatoriu: embed base64 sau acceptă fallback de sistem.)

## 2. Charting: inline SVG (DEFAULT) vs. librărie embedată
- **Inline SVG hand-rolled — DEFAULT-ul acestui skill.** Zero dependențe, fișier mic, control total pe
  theming (moștenește CSS vars), print-fidelity perfectă. Cost: scrii rendererele — dar template-ul are
  deja **line / bar / donut / funnel / sparkline**. Cel mai bun pentru „clean & portable".
- **O singură librărie embedată** (ex. Chart.js inline într-un `<script>`): interactivitate bogată cu
  mai puțin cod, dar **+~200KB**, theming mai greu de legat la brand vars, uneori print mai slab.
  Folosește doar dacă userul cere zoom/tooltip complex.

## 3. Theming pe brand — CSS custom properties ca tokens
Un singur bloc `:root` cu `--brand`, `--brand-2`, `--font` (+ tokens de sistem). Tot restul **derivă**
din ele (accente, hover, charts). Override per-client = schimbi 2–3 linii.
- Pentru SVG: aplică `fill:var(--brand)` **printr-o CLASĂ CSS**, nu ca atribut `fill="var(...)"`
  (atributul nu e suportat universal). Paleta categorică = hex expliciți (independenți de temă).

## 4. Light / dark
`[data-theme="dark"]` pe `<html>` suprascrie variabilele; buton de toggle + `prefers-color-scheme` la
load. Grilele/axele charts citesc `var(--line)`/`var(--muted)` → se adaptează automat; paleta categorică
rămâne (e colorblind-safe în ambele).

## 5. Date editabile / filtrabile
- Un bloc `const DATA = {...}` clar marcat sus = **single source of truth**; tot UI-ul se randează din
  el (re-render pe filtru).
- **Filtre** (perioadă/canal/segment) = re-agregă `DATA` și redesenează. (Template-ul are deja filtru pe
  canal care recalculează KPI + bar + donut.)
- **„Edit mode" opțional:** `contenteditable` pe câmpuri sau inputuri care rescriu `DATA` și re-randează
  — ca un user non-tehnic să-și pună cifrele direct în browser.
- Marchează datele demonstrative `SAMPLE` vizibil; **nu** lăsa cifre inventate nemarcate.

## 6. Print / PDF-ready — VERIFICAT [MDN]
Un singur fișier randează diferit pe ecran vs PDF prin `@media print` — stilurile de print se aplică
**DOAR** la tipărire/PDF, nu pe ecran. Ascunde „chrome-ul" interactiv (butoane, filtre, nav) cu
`display:none` în `@media print`, ca raportul PDF să fie curat. [MDN]
```css
@media print {
  .no-print { display: none !important; }
  .card { break-inside: avoid; box-shadow: none; }
}
```
Edge case: header/footer-ul generat de browser (URL/dată/pagină#) se controlează cu `@page`, nu cu `display:none`.

⚠️ **Forțează LIGHT la print** (gotcha real, prins în practică): dacă pagina e în dark mode când se
tipărește/exportă PDF, `@media print` trebuie să suprascrie **toate** variabilele de temă, nu doar `--bg`
— altfel PDF-ul iese cu carduri dark pe fundal alb. Pattern corect:
```css
@media print{
  :root, [data-theme="dark"]{ --bg:#fff; --surface:#fff; --ink:#0f172a; --muted:#64748b; --line:#e7ecf3; --shadow:none; }
}
```
Bonus: un non-tehnic care deschide fișierul cu **Quick Look** (macOS, spacebar) vede pagină GOALĂ, fiindcă
Quick Look nu rulează JavaScript, iar charts/KPI se desenează din JS. Spune-i userului **să-l deschidă într-un
browser** (sau livrează-i și un PDF). Pentru robustețe maximă la livrarea către clienți non-tehnici, oferă mereu și varianta PDF.

## 7. Responsive
Grid `auto-fit` / breakpoints pentru KPI strip și charts; SVG cu `viewBox` + `width:100%` → scalează
singur. Arată bine pe proiector, laptop și telefon.

## Sources
- MDN — Printing / `@media print` (primary) — https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing
- CSS-Tricks — SVG charting libraries — https://css-tricks.com/svg-charting-libraries/
- CSS-IRL — Dark mode with CSS custom properties — https://css-irl.info/quick-and-easy-dark-mode-with-css-custom-properties/
- Print CSS cheatsheet — https://www.customjs.space/blog/print-css-cheatsheet/
