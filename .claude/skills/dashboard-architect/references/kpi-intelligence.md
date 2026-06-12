# KPI Intelligence — taxonomie & benchmark-uri marketing

*Principiul-cheie e research-grounded și verificat. Benchmark-urile numerice sunt ILUSTRATIVE și expiră
(vezi nota). Taxonomia cross-channel e bună practică de industrie, de validat cu clientul.*

## Principiul-CHEIE (VERIFICAT) — framing benchmark-relativ
Un număr **nu e „bun" sau „rău" în absolut**. Benchmark-urile sunt specifice **pe canal ȘI industrie**,
nu universale. Lipește fiecare KPI de (a) un **benchmark/țintă declarat(ă)** și (b) o **delta
period-over-period**, ca să se citească „bun/rău" la o privire. [WordStream 2025]

> Dovadă: CTR mediu Google Ads 2025 = **6,66%**, dar variază de la **5,44%** (Dentists) la **13,10%**
> (Arts & Entertainment) — spread >2×. Deci hard-code **PRINCIPIUL** (framing benchmark-relativ),
> nu cifra.

## Benchmark-uri ilustrative (2025, Google Ads US) — ⚠️ EXPIRĂ, refresh anual
Date-stamped; există deja ediția 2026. Tratează ca *defaults ilustrative*, nu adevăr etern. (Cifrele
agregă Google + Microsoft Ads, deși sunt etichetate „Google Ads".) [WordStream/LocaliQ 2025, 16.446 campanii US]

| KPI | Median 2025 |
|---|---|
| CTR | 6,66% |
| CPC | $5,26 |
| CVR | 7,52% |
| CPL | $70,11 |

Când construiești pentru un client: **întreabă-i benchmark-ul lui intern** sau caută cifra proaspătă pe
canalul + industria lui. Nu cita orbește 2025.

## Taxonomie KPI pe canal (practică standard marketing-ops — de validat, nu verificată în research)
*Onest: research-ul a confirmat doar stratul PPC engagement (CTR/CPC/CVR/CPL). Restul e consens de industrie.*

- **Paid (social / PPC):** Spend, Impressions, Reach, Frequency, CPM, CPC, CTR, CVR, CPA/CAC, **ROAS**, Revenue.
- **Email:** List size, Deliverability, Open rate, CTR, CTOR, CVR, Unsub rate, Revenue/email.
- **Content / SEO / organic:** Sessions, Users, Engagement rate, Avg. engagement time, Leads, Assisted conversions.
- **E-commerce overlay:** **AOV**, **LTV**, Repeat rate, Cart abandonment, Contribution margin.
- **Events:** Registrations, Show-up rate, Cost/attendee, SQLs, Pipeline influenced.

## Ierarhia metricilor — north-star / suport / diagnostic
Grupare prin *backward design* (de la decizie spre date):
- **North-star (1–3):** metricile de care depinde decizia de business — de obicei **ROAS / Revenue /
  CAC payback / Pipeline**. *Dezbatere reală:* unii CMO susțin că ROAS singur e un north-star slab —
  completează cu profit/LTV. [SEJ]
- **Suport (3–6):** explică north-star-ul — CVR, AOV, CTR, frequency.
- **Diagnostic (rest):** arată *de ce* se rupe ceva — CPM, bounce, deliverability.

În dashboard: **north-star în KPI strip (sus)** · suport în charts · diagnostic în tabel/drill-down.

## Cum aplică skill-ul (chiar dacă userul dă „orice metrici", fără preset)
1. **Clasifică** metricile primite în north-star / suport / diagnostic.
2. **Atașează** fiecărei metrici delta vs perioada anterioară (mereu) + benchmark/țintă (dacă există).
3. **Sugerează** 1–2 metrici cu valoare mare care lipsesc (ex.: ai spend + revenue dar nu ROAS →
   calculează-l). Fără să forțezi.

## Sources
- WordStream/LocaliQ — 2025 Google Ads benchmarks — https://www.wordstream.com/blog/2025-google-ads-benchmarks
- 360om — 2025 PPC benchmarks by industry — https://www.360om.agency/news-insights/google-ads-benchmarks-2025-ctr-cpc-cvr-cpl-key-ppc-metrics-by-industry
- Search Engine Journal — Rethinking ROAS as a north-star — https://www.searchenginejournal.com/why-cmos-should-rethink-roas-as-a-north-star-metric/550881/
- Databox — North-star metrics — https://databox.com/north-star-metrics
