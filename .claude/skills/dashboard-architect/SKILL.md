---
name: dashboard-architect
description: >-
  Co-creează și construiește dashboard-uri interactive, personalizate și presentation-ready ca un SINGUR fișier HTML self-contained (zero dependențe de rețea, light/dark, print/PDF-ready) — din ORICE date îi dai. Cazul-vedetă: review de performanță campanie / marketing (summary metrics, charts, executive summary, key insights, recommended next steps), dar motorul e generic și merge cu orice KPI de business. Folosește când Paul — sau un client de-al lui — vrea să transforme date brute într-un dashboard frumos, util, ajustabil. Trei moduri de livrare: (1) Paul prezintă clientului, (2) clientul îl folosește intern, (3) clientul îl folosește cu propriii clienți. Construit pentru livrările AI BOOST: orice participant îl poate refolosi singur. Te intervievează socratic, O ÎNTREBARE PE RÂND, auto-detectează formatul datelor (descriere în cuvinte / screenshot din Ads Manager / tabel-CSV lipit / formular ghidat), default neutru-profesional cu override de brand ușor (logo + culori + font în 10 secunde), apoi construiește în fișier real și verifică în browser. RĂSPUNDE MEREU în limba userului. Triggers RO: „fă-mi un dashboard", „dashboard de campanie", „dashboard interactiv", „raport de performanță", „dashboard pentru client", „arată-mi performanța campaniei", „dashboard de marketing", „fă-mi un raport vizual", „transformă datele astea în dashboard". Triggers EN: „build me a dashboard", „campaign performance dashboard", „marketing dashboard", „make a performance report", „review campaign performance", „interactive dashboard", „client-ready dashboard". NU pentru slide-uri/deck-uri (presentation-architect), cursuri e-learning (elearning-architect), oferte (offer-creator-curs), scripturi video (viral-script-creator), sau fișiere pur Excel fără vizual (xlsx).
---

# Dashboard Architect

Transformă date brute într-un **dashboard care provoacă o DECIZIE** — frumos, interactiv, personalizat
pe brand, livrat ca un singur fișier HTML self-contained pe care îl deschizi din email, de pe stick
sau îl proiectezi într-o ședință. Rulează în două faze: **(1) un interviu socratic de co-creare, o
întrebare pe rând**, apoi **(2) build real + verificare în browser**.

Construit pentru livrările **AI BOOST**: e suficient de deștept ca să-l conducă Paul în fața unui
client, dar suficient de simplu ca un participant non-tehnic să-l refolosească singur a doua zi.

## PRIME DIRECTIVE
Un dashboard reușește când **schimbă o decizie**, nu când „arată date". Fiecare element trebuie să
răspundă la *„și ce? → acum ce?"*. Dacă un grafic, un număr sau o secțiune nu ajută cititorul să
decidă ceva, **e tăiat**. Numerele fără narativ sunt zgomot; narativul fără numere e opinie. Skill-ul
livrează mereu **amândouă**: cifra ȘI ce să faci cu ea.

---

## CUM FUNCȚIONEAZĂ — 2 faze

- **FAZA 1 — Interviu de co-creare** (ești ELICITOR + STRATEG DE DATE + EDITOR fuzionați). Pui cea mai
  mică întrebare care deblochează cel mai mult, una pe rând, până ai destul pentru un build de
  încredere. Auto-detectezi cum vin datele și te adaptezi. NU pui o listă fixă de întrebări.
- **FAZA 2 — Build & verify.** Structurezi datele, alegi anatomia potrivită, construiești fișierul HTML
  self-contained folosind `assets/dashboard-template.html` + bibliotecile de reguli din `references/`,
  aplici principiile obligatorii, **verifici în browser cu preview tools**, apoi livrezi în modul cerut.

> **Limbă:** detectează limba userului din primul mesaj și răspunde + construiește UI în acea limbă.
> Termenii tehnici de marketing (ROAS, CTR, CPA) pot rămâne în EN dacă așa se folosesc în piață.

---

## FAZA 1 — INTERVIUL DE CO-CREARE (engine)

### Prima mișcare (primele 30 sec)
Primul mesaj: într-o linie caldă, întreabă pe ce ton lucrați — opțiuni tappable, fiecare pe rândul ei:
**Direct / Cald / Provocator / Scurt**. Apoi imediat: *„Ce decizie ar trebui să ajute dashboard-ul
ăsta — și cine se uită la el?"* (cea mai mare întrebare de information-gain). Recalibrează tonul din
răspunsuri.

**Arată ÎNTÂI un exemplu gata, apoi oferă 3 puncte de pornire.** Pagina albă = paralizie pentru
non-tehnici, dar un interogatoriu lung îi alungă. Deci: **(1) demo-first** — arată-le imediat un dashboard
COMPLET de mostră (`assets/dashboard-template.html`, „așa va arăta al tău") ca să prindă „aha"-ul în 30 sec
fără să răspundă la nimic. **(2)** Apoi: *„Sună a vreunul dintre astea?"* — tappable:
**① Performanță campanie (paid: Meta/Google)** · **② Raport vânzări/lunar** · **③ Funnel de conversie**
· **④ Altceva**. Alegerea pre-completează metricile + graficele potrivite (din `kpi-intelligence.md`)
ȘI **ESTE** lista „ce cifre să pregătești" — nu o repeta separat. Motorul rămâne generic: „altceva" =
pornești de la ce dă userul.
> *(Din pressure-test: „generic fără nicio șină" e prea neopinionat — dar nici nu interoga. Demo-first + o singură listă.)*

### Mecanica
Întreabă **un singur lucru** odată. După fiecare răspuns: actualizează modelul despre dashboard,
identifică singura necunoscută care l-ar schimba cel mai mult, și întreab-o exact pe aceea. Oferă
opțiuni A/B/C tappable când există (fiecare pe rândul ei); text liber doar când răspunsul e genuin
deschis. O linie de „ce s-a clarificat" după fiecare răspuns. Arată progresul („Î2 din ~5").
**Metrica nu e „pune multe întrebări", ci „cele mai puține, cele mai adânci".**

### SLOTURILE de umplut (ordine = pâlnie; SARI peste ce e deja clar din cerere)
1. **Decizia + audiența** — ce decizie servește dashboard-ul și cine îl citește. Asta ancorează tot
   (ce metrici contează, ce ton, cât de detaliat). *Un board vede altceva decât un performance marketer.*
2. **Modul de livrare** (vezi „Cele 3 moduri"): (A) Paul prezintă → optimizat pentru proiecție/storytelling;
   (B) client intern → optimizat pentru self-service & filtrare; (C) client cu clienții lui → optimizat
   pentru white-label & branding. Determină densitatea și interactivitatea.
3. **Datele** — *auto-detect*: vezi „Cum intră datele". Nu cere un format anume; ia ce dă userul și
   structurează tu. Cere doar ce lipsește și chiar contează pentru decizie.
4. **Metricile & perioada** — generic, fără preset impus: lucrează cu metricile pe care le ARE userul.
   DAR aplică inteligența din `references/kpi-intelligence.md` ca să: (a) clasifici metricile (north-star /
   suport / diagnostic), (b) atașezi delta vs. perioada anterioară + target/benchmark dacă există,
   (c) *sugerezi* 1-2 metrici valoroase care lipsesc — fără să forțezi.
5. **Branding** — default **neutru-profesional**. Întreabă scurt: „brand de aplicat (logo + 2-3 culori +
   font) sau las neutru?". Dacă dă brand, salvează-l ca profil (vezi „Profiles"). Override-ul stă într-un
   singur bloc clar la începutul fișierului — schimbabil în 10 secunde.
6. **Scope & distribuție** — un dashboard single-file (default) sau ceva mai mare; doar fișier / deschis
   în browser / trimis cuiva / pus pe un link. (De obicei: single-file, livrat ca atare.)

Dacă cererea acoperă deja un slot, **nu-l mai întreba**. Când ai destul pentru un build de încredere →
fă un mic **premortem** într-o linie („dacă dashboard-ul ăsta ar eșua, ar fi pentru că ___; deci adaug
___") și treci la build.

### Cum intră datele — AUTO-DETECT (toate trei + mixt)
Detectează formatul și adaptează-te, fără să ceri userului să se conformeze:
- **Descriere în cuvinte / voce** → extrage entități (canal, buget, impresii, click-uri, conversii,
  venit, perioadă) și structurează-le. Confirmă tabelul reconstruit înainte de build.
- **Screenshot / imagine** (Ads Manager, GA4, Looker, un PDF de raport) → citește cifrele din imagine,
  reconstruiește tabelul, confirmă-l.
- **Tabel / CSV / Excel lipit** → parsează direct; mapează coloanele la roluri (dimensiune, metric,
  perioadă). Dacă există fișier `.xlsx`/`.csv`, citește-l.
- **Nimic / „nu am date acum"** → intră în **formular ghidat**: întrebi câmp cu câmp și/sau generezi date
  demonstrative realiste, **marcate vizibil ca `SAMPLE`**, ca userul să le înlocuiască.

Regula de aur: **niciodată nu inventa cifre fără să le marchezi `SAMPLE`.** Datele oneste sunt sfinte
(vezi Principiul 3).

### 🚦 GATE OBLIGATORIU — confirmarea datelor ANCORATĂ LA SURSĂ (singura oprire serioasă)
Cel mai important pas — DAR cu capcana prinsă în runda 2 de council: dacă doar *repeți* cifra pe care ai
citit-o TU, confirmi propria eroare. Userul non-tehnic dă „da" orb pe o cifră pe care modelul a citit-o
greșit din screenshot (ex. `2,3` citit ca `23`). Eroarea e deja coruptă la *citire*, nu la *transcriere*.
Deci gate-ul trebuie **ancorat la sursă**, nu un ecou:
- Arată cifrele ca **tabel editabil, fiecare cu sursa ei**: „din screenshot, rândul «CTR» → **2,3%**".
- Pentru cele **2–3 KPI critice** (cele care intră în titlu/decizie), cere userului să le **confirme
  uitându-se la sursă** (sau să le re-scrie) — nu un „da" global. Restul: pre-completate, userul doar
  corectează ce e greșit (zero-effort by default).
- Capcane de citit: virgulă zecimală RO (`1,4` ≠ `14`), procent vs valoare, coloană tăiată din screenshot.

Construiește DOAR după ce cifrele critice sunt confirmate la sursă. **Asta e singura oprire serioasă** —
restul verificărilor le faci TĂCUT, în fundal (vezi Safeguards), nu ca încă o întrebare. (Lista „ce cifre
îți trebuie" e deja dată de exemplul de pornire ales — n-o repeta.)

---

## FAZA 2 — BUILD

### Arhitectura output (default)
Un **singur fișier `.html` self-contained**: tot CSS-ul și JS-ul inline, zero request-uri de rețea,
fonturi cu fallback de sistem, grafice randate din date inline. Se deschide offline, merge din email,
se proiectează curat, se exportă în PDF. Pleci de la `assets/dashboard-template.html` și îl populezi.

### Anatomia unui dashboard (de sus în jos — inverted pyramid)
1. **Header / brand bar** — logo + titlu + perioadă + (opțional) filtru global. Discret, nu domină.
2. **KPI strip (above the fold)** — 3-6 carduri cu metricile north-star: cifră mare, delta vs. perioada
   anterioară (verde/roșu + săgeată), target/benchmark dacă există, sparkline mic. **Regula celor 5 secunde**:
   de aici cititorul prinde „cum stăm" fără scroll.
3. **Executive summary** — 2-4 propoziții, scrise ca **verdict + decizie**, nu descriere. Folosește
   framework-urile din `references/narrative-frameworks.md` (pyramid: răspuns întâi).
4. **Charts grid** — fiecare grafic = un mesaj; tipul ales după mesaj (vezi `references/dataviz-rules.md`).
   Trend în timp = line; comparație categorii = bar; pași/drop-off = funnel; parte-din-întreg (max 4-5) =
   donut; detaliu = tabel sortabil. Fiecare cu titlu care spune insight-ul, nu doar „CTR pe canal".
5. **Key insights** — 3-5 bullets, fiecare: *observație → de ce contează → magnitudine*. Legate de cifre.
6. **Recommended next steps** — acțiuni concrete, prioritizate (impact × efort), cu owner/orizont dacă se
   poate. Aici dashboard-ul devine util, nu doar frumos.
7. **Footer** — sursă date, perioadă, „generat cu AI BOOST" (opțional, în modul Paul), data.

> Adaptează anatomia la mod și audiență: board → summary + 4 KPI + 2 charts + next steps (compact);
> performance marketer → mai multe charts + tabel filtrabil + drill-down.

### Branding — neutru default + override ușor
Sus în fișier, un bloc unic și comentat:
```
:root{
  --brand:#2563eb;        /* culoarea principală a clientului */
  --brand-2:#0ea5e9;      /* accent */
  --ink:#0f172a; --bg:#ffffff; --muted:#64748b;
  --font: ui-sans-serif, system-ui, "Inter", Arial, sans-serif;
  /* LOGO: înlocuiește textul .brand-logo sau pune un <img>/SVG inline */
}
```
Default = neutru-profesional (albastru sobru, gri, alb). Cu brand → schimbi 2-3 culori + logo + font,
restul se recalculează (accente, hover, charts moștenesc paleta). Paletă colorblind-safe pentru date.

### Interactivitate & „ajustabil"
Vanilla JS, zero dependențe externe (sau o singură librărie de chart embedată inline — vezi
`references/html-patterns.md`). Implementează doar ce servește decizia:
- **Filtre** (perioadă / canal / segment) care recalculează KPI-urile și graficele.
- **Toggle light/dark** (buton + `prefers-color-scheme`).
- **Date editabile**: un bloc `const DATA = [...]` clar marcat sus, ușor de înlocuit; opțional un mic
  „edit mode" care lasă userul să schimbe cifre în browser și vede dashboard-ul actualizându-se.
- **Export**: buton „Print / Save as PDF" + `@media print` curat (ascunde controale, păstrează charts).
- **Responsive**: arată bine pe proiector, laptop și telefon.

### Cele 10 PRINCIPII OBLIGATORII (quality gate)
1. **Decision-first** — fiecare element răspunde „și ce? / acum ce?". Altfel iese.
2. **Regula celor 5 secunde** — KPI-urile-cheie + verdictul, vizibile fără scroll.
3. **Date oneste** — fără axe trunchiate înșelător, fără cherry-picking; arată perioada de comparație
   și sursa. Datele inventate se marchează `SAMPLE`.
4. **Un grafic = un mesaj** — tipul de grafic potrivit mesajului; fără chart junk, fără 3D, fără donut cu 9 felii.
5. **Ierarhie vizuală** — north-star sus, suport la mijloc, diagnostic jos; respectă citirea F/Z.
6. **Context, nu doar cifre** — fiecare metric cu delta vs. perioada anterioară + target/benchmark când există.
7. **Accesibilitate** — contrast AA, paletă colorblind-safe, sensul nu transmis DOAR prin culoare.
8. **Self-contained** — un fișier, zero rețea; rulează offline, din email, de pe stick.
9. **Print/PDF-ready** — `@media print`, se exportă curat ca raport.
10. **Narativ deasupra numerelor** — executive summary + insights + next steps scrise ca DECIZII.

### Verificare în browser (obligatoriu înainte de livrare)
Folosește preview tools: `preview_start` pe fișier → `preview_snapshot` (structură & conținut) →
`preview_console_logs` (zero erori) → testează un filtru cu `preview_click` → `preview_resize` (mobil +
dark) → `preview_screenshot` pentru dovadă. Repari în sursă, re-verifici. **Nu cere userului să verifice
manual** — arăți tu dovada (screenshot).

### Cele 3 moduri de livrare
- **(A) Paul prezintă clientului** — storytelling-first: summary mare, charts curate pentru proiector,
  „generat cu AI BOOST" în footer, mai puțină interactivitate (e ghidat live).
- **(B) Clientul îl folosește intern** — self-service: filtre, edit-mode pe date, instrucțiuni scurte
  „cum îți pui datele tale", neutru sau brandul lor.
- **(C) Clientul cu propriii clienți (white-label)** — branding-ul clientului peste tot, fără urme AI
  BOOST/AI Hackers dacă cere, secțiune de „ce recomandăm" pregătită pentru a fi prezentată.

Întreabă în Faza 1 care mod (sau „toate / nu știu încă" → construiește **B**, cel mai flexibil, și explică
cum se comută). **Secvențiere (din pressure-test):** B e default-ul sigur pentru primele livrări; **C
(white-label) e premiul strategic** — transformă clientul în mini-agenție care livrează dashboard-uri
*clienților lui* — dar nu conduce cu el la un prim workshop, e ușor scope-creep. Promovează-l după ce B funcționează.

---

## GATES & SAFEGUARDS (distilate din 2 runde de pressure-test — runda 2 a corectat runda 1)

**Principiu (corecția majoră a rundei 2): o SINGURĂ oprire vizibilă (gate-ul ancorat la sursă), restul
TĂCUT.** Prea multe „ești sigur?" erodează încrederea la fel ca o eroare și-l alungă pe non-tehnicul care
voia rezultat în 3 minute. Nu cumula porți — fă-le invizibile.

1. **Gate de date ancorat la sursă** = singura oprire vizibilă (vezi 🚦 mai sus). Nu un ecou al cifrei citite.
2. **Self-check de consistență — TĂCUT, niciodată „am verificat, deci e corect".** Validează intern și
   corectează/semnalează în fundal: procente ~100%, delta cu direcția corectă (CPA jos = bun),
   ROAS=venit/spend, CPA=spend/conversii, CTR=click/impresii, funnel descrescător, nicio conversie >100%,
   fără împărțire la zero. ⚠️ Asta prinde inconsistența **aritmetică**, NU corespondența cu realitatea
   (`47` vs `74` trec amândouă) — deci nu-i da userului o falsă siguranță. E o plasă, nu o garanție.
3. **Onestitatea NARATIVULUI (al doilea eșec tăcut, prins în runda 2).** Cifrele pot fi corecte, dar un
   *insight* halucinat. Regulă: **fiecare propoziție din executive summary / insights se leagă de o cifră
   de pe dashboard.** Fără cauze inventate („listă obosită") dacă nu există dovada în date; marchează
   interpretările ca interpretări.
4. **Strat de ÎNCREDERE pentru prezentator (problema REALĂ, nu doar acuratețea).** Non-tehnicul nu se teme
   de o formulă greșită, ci de „mă fac de râs" — iar de râs te face ezitarea. Dă-i opțional **2–3 puncte de
   vorbit** lângă dashboard: „dacă te întreabă «de ce a scăzut CPA?» → «am tăiat creativele slabe pe TikTok»".
   Apărarea verbală cumpără încredere — **completează** acuratețea, n-o înlocuiește.
5. **Gardă SAMPLE + DRAFT, tăcută până la livrare.** Cât există cifre `SAMPLE`: badge + disclaimer „draft —
   verifică înainte de trimitere". O singură întrebare, la final: „ai pus cifrele tale?". Scoate-le la `meta.sample=false`.
6. **Editare în limbaj natural DUPĂ build** („schimbă CPC în 1,2", „adaugă Iunie", „scoate funnel-ul") — tu
   reconstruiești, userul nu atinge cod. La schimbarea unei cifre critice → re-confirmă DOAR acea cifră.
7. **Mobil = garanție, nu pas de user.** Verifică automat la lățime mică (`preview_resize` mobil); clienții deschid pe telefon.
8. **Safeguards pe MOD de livrare (riscuri diferite — runda 2).** Modul A (Paul prezintă, e acolo să
   confirme) ≠ Modul C (clientul → clienții LUI, nimeni în buclă). **Modul C = ancorare la sursă +
   disclaimere maxime**, fiindcă nu există expert care să prindă o cifră greșită.

> **Înainte de primul workshop — MĂSOARĂ, nu intui:** dă skill-ul orb pe 3–5 screenshot-uri reale de la
> oameni diferiți și numără câte cifre ies greșit (numărul din dashboard vs numărul din poză). Rata aia
> îți spune cât de tare să ancorezi gate-ul. Ăsta e singurul „luni dimineață" care contează.

---

## REFERENCES (citește-le la nevoie, nu le încărca pe toate din start)
- `references/kpi-intelligence.md` — taxonomie metrici marketing/business, ce înseamnă fiecare, benchmark-uri
  orientative pe canal, cum grupezi north-star / suport / diagnostic. *(Pentru sloturile 4 + clasificare.)*
- `references/dataviz-rules.md` — ce tip de grafic pentru ce mesaj, reguli de culoare & accesibilitate,
  anti-chart-junk. *(Pentru charts grid.)*
- `references/narrative-frameworks.md` — cum scrii executive summary, insights și next steps decision-ready
  (pyramid principle, so-what/now-what, prioritizare impact×efort). *(Pentru secțiunile narative.)*
- `references/html-patterns.md` — pattern-uri pentru fișier HTML self-contained: charts inline (SVG vs.
  librărie embedată), theming, filtre, edit-mode, print/PDF, responsive. *(Pentru build.)*
- `references/_research-brief.md` — proveniența cunoștințelor (ce e verificat, ce e ilustrativ/expiră,
  ce e infirmat, lista de surse). *(Citește când ai dubii despre o regulă sau vrei refresh.)*

## PROFILES (memorie per-client)
Când un client dă brand (logo + culori + font + preferințe), salvează-l ca
`profiles/<client-slug>.json`. La o livrare viitoare pentru același client, încarcă profilul și sari peste
întrebările de branding. (Model identic cu `recipe-architect/profiles/`.)

## EXAMPLES & TEMPLATE
`assets/dashboard-template.html` e simultan **template-ul de clonat** ȘI un **worked-example complet**
(brand „Nordic Coffee", date `SAMPLE` realiste, verificat în browser: 5 KPI cu delta+țintă, line/bar/donut/
funnel, filtre live, light/dark, print). Pornește de acolo: clonează → înlocuiește `DATA` + branding +
narativ. `examples/` rămâne pentru livrările reale salvate (per client).

---

## ANTI-PATTERNS (semne că ai greșit)
- Dashboard „frumos" din care nu reiese nicio decizie → ai încălcat Prime Directive.
- KPI strip cu 12 numere egale ca importanță → nu există ierarhie; cititorul se pierde.
- Grafice fără titlu-insight („Chart 1") → muncă lăsată în seama cititorului.
- Donut cu 8 felii / bar 3D / dublu-axă derutantă → chart junk.
- Cifre fără perioadă de comparație sau sursă → date neîncrezabile.
- Dependențe externe (CDN, Google Fonts live, API) → nu mai e self-contained, pică offline.
- Ai inventat cifre fără să le marchezi `SAMPLE` → încredere distrusă.
- Ai pus 8 întrebări în Faza 1 când 3 ajungeau → ai ratat „cele mai puține, cele mai adânci".
