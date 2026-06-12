# Research Brief — proveniență & ce să reîmprospătezi

*Sinteza care stă la baza fișierelor din `references/`. Produsă printr-un deep-research adversarial
(5 unghiuri · 26 surse · 125 claims extrase · 25 verificate prin vot 3-vote · 24 confirmate, 1 infirmat).
Generat: iunie 2026.*

## Ce e SOLID (surse primare, vot 3-0)
- **Chart selection** by data relationship (FT Visual Vocabulary, 9 familii) + task mappings (Tableau).
- **Pie/donut** slab pentru comparație precisă → bars (FT; Cleveland & McGill 1984).
- **Colorblind-safe**: ~8% bărbați; default blue/orange; red/green doar cu redundant encoding (Tableau/Shaffer, Claus Wilke).
- **Design prin eliminare** + culoare cu zgârcenie (Storytelling With Data, Tableau).
- **Narativ executiv**: concluzia întâi (BLUF/Pyramid), pleacă de la intenția audienței, explanatory cu POV, 7 story structures (Tableau).
- **Ierarhie vizuală**: cel mai important view sus/stânga-sus (F-pattern), „big gets noticed" (Tableau, NN/G, Sessions).
- **Print/PDF**: `@media print` + `display:none` pe chrome → un fișier, două randări (MDN).

## Ce e ILUSTRATIV / expiră ⚠️
- **Benchmark-urile Google Ads 2025** (CTR 6,66% · CPC $5,26 · CVR 7,52% · CPL $70,11; CTR 5,44–13,10%)
  sunt **date-stamped** (ediția 2026 există deja) și agregă Google+Microsoft. **Hard-code principiul
  (framing benchmark-relativ), nu cifrele.** Refresh anual.
- **CVD ~8%** = populații vestice; ~4,4% global. Concluzia (CVD = grijă reală) ține la ambele.
- **Red/green-cu-etichete** a trecut doar 2-1 — default conservator: blue/orange + redundant encoding.
- **„Data-ink ratio"** = principiu soft (Bateman 2010 „Useful Junk?" nuanțează Tufte).

## INFIRMAT (nu băga în skill)
- „Limitează dashboard-ul la 3–4 view-uri" — **vot 0-3** vs pagina oficială Tableau. Fără cap dur de grafice.

## GAP-uri de acoperire (de completat cu clientul / refresh viitor)
- Taxonomie cross-channel completă (ROAS/CAC/LTV/AOV/atribuire, grupare north-star) — doar stratul PPC a fost verificat; restul în `kpi-intelligence.md` e bună practică de validat.
- Benchmark-uri non-PPC (paid social, email, content, organic, events).
- Alegerea charting-engine (inline SVG vs librărie embedată) — recomandat inline SVG din portabilitate.
- Pattern-uri editable/themeable concrete — acoperite în `html-patterns.md` ca recomandări.

## Lista completă de surse (26)
**Primary:** FT Visual Vocabulary · Tableau dataviz best practices · Tableau story best practices ·
Storytelling With Data · MDN Printing.
**Secondary/authority:** Tableau (Stephen Few) · Tableau/Shaffer (CVD) · Sessions College (visual hierarchy) ·
NN/G (F-pattern).
**Benchmarks:** WordStream/LocaliQ 2025 · 360om · 27five (Meta 2026) · SEJ · Databox.
**Narrative:** think-cell (Pyramid) · ThoughtSpot · Pyramid Analytics · Winning Presentations · Medium/Minto.
**Layout:** Intelligent Graphic & Code · DataCamp · Improvado.
**Technical:** CSS-Tricks (SVG libs) · OpenReplay (charts.css) · customjs (print cheatsheet) · CSS-IRL (dark mode).

> Pentru refresh: re-rulează `/deep-research` pe „2026 marketing KPI benchmarks by channel" și
> actualizează doar `kpi-intelligence.md`. Restul principiilor sunt stabile.
