# Dataviz Rules — ce grafic, pentru ce mesaj

*Bază de cunoștințe research-grounded (surse la final). Citește la pasul „charts grid".*

## Regula #1 — Alege graficul după RELAȚIA din date, nu după „ce arată drăguț"
FT Visual Vocabulary organizează graficele în **9 familii funcționale** (Deviation, Correlation,
Ranking, Distribution, Change over Time, Part-to-Whole, Magnitude, Spatial, Flow). Întâi întrebi
*„ce relație din poveste contează?"*, apoi alegi graficul din acea familie. [FT, Tableau]

| Vrei să arăți | Folosește | Evită |
|---|---|---|
| Schimbare în timp (trend) | **line** | pie/donut |
| Comparație între categorii | **bar/column** | pie când contează ranking-ul |
| Progres față de o țintă | **bullet chart** (înlocuiește gauge/meter/termometru) | gauge, 3D |
| Parte-din-întreg, la o privire | **donut/pie** (max 4–5 felii, fără ranking fin) | pie cu 8 felii |
| Pași într-un proces / drop-off | **funnel** | — |
| Multe valori exacte | **tabel sortabil** | grafic aglomerat |
| Unde se grupează datele | **histogram / box plot** | — |

> Bullet chart-ul e *explicit conceput să înlocuiască* gauge-urile/termometrele pentru „progres vs țintă" (Stephen Few, 2005). [Tableau]

## Regula #2 — Evită pie/donut când contează comparația precisă
Segmentele de pie sunt greu de comparat exact (Cleveland & McGill 1984: poziția pe o axă comună se
citește mai precis decât unghi/arie). Dacă cititorul trebuie să **ranking-uiască sau compare precis**
→ bar. Pie/donut e OK *doar* pentru proporție part-to-whole la o privire. [FT]

## Regula #3 — Paletă colorblind-safe (cerință, nu nice-to-have)
~8% dintre bărbați (populații vestice; ~4,4% global) au deficiență de vedere a culorilor. Sub CVD
puternic, **roșu / verde / portocaliu / maro se confundă**. [Tableau/Shaffer, Claus Wilke]
- **DEFAULT sigur: blue/orange** (sau blue/red, blue/brown) — albastrul rămâne albastru pentru cele mai comune tipuri.
- Roșu/verde (ex. delta +/−) e OK **doar dacă culoarea NU e singurul semnal** — adaugă săgeată/iconiță/etichetă (*redundant encoding*). [Claus Wilke]
  → În template, delta folosește **▲/▼ + semn + culoare** = conform.
- Paleta categorică din template (Okabe-Ito tuned) e colorblind-safe în light și dark.

## Regula #4 — Design prin eliminare; culoarea cu zgârcenie
„Perfecțiunea = când nu mai ai ce scoate." Elimină non-esențialul. Prea multe culori = *cacofonie*;
prea multe nuanțe ale aceleiași culori = datele se contopesc. Culoarea urmează asocieri învățate
(roșu = cald, albastru = rece). Max ~6–8 culori. [Storytelling With Data, Tableau]
- „Data-ink ratio" = principiu **direcțional (soft)**, nu dogmă: puțin embellishment ajută memorabilitatea (Bateman 2010, *Useful Junk?*). Scoate clutter-ul non-esențial, **nu** substanța.

## Regula #5 — Fă lectura fără efort; dirijează atenția
Un grafic bun face „modul corect de a citi" intuitiv — *„nu trebuie să pară muncă"*. Creează ierarhie
vizuală: scoate în față esențialul, împinge restul în fundal. Mută efortul de pe creier pe ochi
(memoria de lucru nu ține detaliile mai multor grafice). [Storytelling With Data, Stephen Few]
- „Capture the essence without oversimplifying" (Few) — simplifică prezentarea, nu substanța.

## Micro-patterns (practică standard de dashboard, consens larg)
- **Sparkline:** trend minimal lângă un KPI, fără axe — pentru *direcție*, nu valoare exactă. Doar dacă ai serie reală.
- **Period-over-period delta:** fiecare KPI cu Δ% vs perioada anterioară + săgeată + culoare (vezi Regula #3).
- **Scorecard / KPI strip:** cifră mare + delta + țintă; „big gets noticed" (vezi `narrative-frameworks` + layout).
- ⚠️ **NU** impune o limită de „3–4 grafice" — research a INFIRMAT-o (vot 0-3 vs Tableau). Pune câte servesc decizia.

## Sources
- FT Visual Vocabulary (primary) — https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md
- Tableau — Data visualization best practices (primary) — https://www.tableau.com/visualization/data-visualization-best-practices
- Storytelling With Data, C. N. Knaflic (primary) — https://www.storytellingwithdata.com/blog/2017/8/9/my-guiding-principles
- Tableau / J. Shaffer — Red/green & CVD — https://www.tableau.com/blog/examining-data-viz-rules-dont-use-red-green-together
- Claus Wilke — Fundamentals of Data Visualization (redundant coding) — https://clauswilke.com/dataviz/redundant-coding.html
- Stephen Few (via Tableau) — https://www.tableau.com/blog/stephen-few-data-visualization
