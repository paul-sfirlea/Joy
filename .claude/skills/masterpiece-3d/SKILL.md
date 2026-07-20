---
name: masterpiece-3d
description: >-
  Transformă orice artefact, prezentare HTML sau site într-o experiență gallery-grade — profesională,
  3D, cu elemente care se mișcă ușor în fundal și un element viu DIFERIT pe fiecare scenă — păstrând
  EXACT coloristica și identitatea vizuală pe care i-o dă userul, fără să deturneze niciodată de la
  scris sau de la idei. E stratul de ELEVARE estetică peste un artefact: nu inventează conținut, îl
  amplifică vizual până arată ca o operă de artă. Totul self-contained (zero CDN, CSP-safe: fonturi și
  imagini inline ca data-URI, Canvas 2D + CSS 3D + WebGL scris de mână — niciodată three.js/GSAP prin
  link), cu assets REALE extrase din brand (logo-ul real, nu recreat), un element 3D distinct pe fiecare
  slide, și un LOOP de calitate (stress-test + 10x) prin care trece doar cea mai bună variantă. Textul
  rămâne mereu vedeta (fundal ≤ 0.14 opacitate sub text). Folosește când Paul vrea ca un artefact/site
  să arate MULT mai premium, viu, cinematic, futurist. Triggers RO: „fă-l 3D", „fă artefactul/site-ul
  mai profesional", „fă-l ca o operă de artă", „adaugă elemente care se mișcă", „elemente 3D în background",
  „fă-l world class vizual", „fă-l futurist/cinematic", „amplifică vizual", „fundal care pulsează/curge/se
  rotește", „site care se mișcă", „mai spectaculos vizual", „masterpiece". Triggers EN: „make it 3D",
  „make this look premium / world-class", „like a work of art", „gallery-grade", „add moving background
  elements", „cinematic 3D site", „make it feel alive", „elevate the visuals". NU pentru conținutul sau
  structura slide-urilor (presentation-architect), NU pentru dashboard-uri de date (dashboard-architect),
  NU pentru un artefact simplu funcțional fără ambiție vizuală (design-ul de bază e suficient acolo). Acest
  skill intră când miza e ca artefactul să arate ca operă de artă, nu doar curat.
---

# Masterpiece 3D

Transformă un artefact într-o **operă de artă care se mișcă** — premium, cinematic, cu adâncime 3D și un
element viu distinct pe fiecare scenă — **fără să atingă conținutul** și **fără să deturneze de la scris**.
E un strat de elevare estetică peste HTML existent (sau nou), livrat ca **un singur fișier self-contained**.

Motto: *scrisul e vedeta; totul în jur amplifică, nimic nu distrage.*

---

## Cele 8 non-negociabile (citește-le primul — ele decid tot)

1. **Coloristica userului, sfântă.** Ia paleta EXACTĂ pe care o cere (sau extrage-o din brand). Tot ce
   construiești — particule, linii, glow, gradient — derivă din ea. Nu impui niciodată alte culori.
2. **Textul e vedeta.** Orice element ambiental sub zona de text stă la **opacitate ≤ 0.14**; mișcarea nu
   trece niciodată peste lizibilitate. Dacă un efect fură atenția de la scris, e prea mult — taie-l.
3. **Self-contained / CSP-safe.** Zero CDN. Fonturi inline (data-URI woff2), imagini base64, scripturi
   inline. Doar **Canvas 2D + CSS 3D transforms + WebGL scris de mână**. three.js / GSAP / Lenis / tsparticles
   NU sunt disponibile prin link în artefacte — disciplina asta e chiar diferențiatorul skill-ului.
4. **Assets REALE, niciodată recreate.** Logo-ul, marca, iconurile de brand se **extrag** (vezi
   `references/asset-pipeline.md`). Un logo redesenat de mână arată amatoricesc — nu-l recrea niciodată.
5. **Un element viu DISTINCT pe fiecare scenă.** Fiecare slide primește propriul obiect-erou / efect, ca
   să nu se simtă repetitiv. Meniul e în `references/technique-library.md`.
6. **Mișcare calmă, cu sens.** Ambient lent (20–60s/ciclu), accent scurt o singură dată la avans (<1.2s),
   un puls la schimbarea de slide. Nimic haotic, nimic care apare/dispare confuz.
7. **Disciplină de performanță & siguranță.** Sprite-uri pre-randate (NU `shadowBlur` per frame), bucle cu
   pas fix (NICIODATĂ `x+=W/n` → buclă infinită dacă W=0), DPR cap 2, guard `W>1/H>1`, pauză pe tab ascuns,
   densitate redusă pe mobil, `prefers-reduced-motion`. Detalii în `references/guardrails-and-loop.md`.
8. **Trece doar cea mai bună variantă.** Nu livrezi prima versiune. Rulezi Loop-ul (Faza 6): premortem
   (stress-test) → 10x → verificare vizuală în browser → doar ce trece de checklist-ul gallery-grade pleacă.

---

## Faza 0 — Brief (rapid, max 1–3 întrebări)

Deduce din conversație; întreabă doar golurile reale:
- **Coloristica?** Paleta exactă (hex-uri) sau brand-ul din care o extrag. *Ăsta e singurul input obligatoriu.*
- **Subiectul & vibe-ul?** (ex: World Class / cocktailuri → Art-Deco auriu; fintech → neon-glass; wellness → organic-soft). Vibe-ul alege atmosfera.
- **Ce e artefactul?** Un artefact nou de construit, sau unul existent de elevat (dă-mi fișierul/URL-ul).
- **Unde se prezintă?** Full-screen la eveniment (desktop, click-driven) vs. link trimis (scroll). Decide navigarea.

Dacă brief-ul e destul de bogat, sari direct la Faza 1 și enunță asumpțiile.

## Faza 1 — Assets reale

Adună identitatea vizuală reală înainte de orice cod. Vezi `references/asset-pipeline.md`:
- Extrage **logo-ul / marca** reală (din PDF de brand, imagine, site) → PNG transparent, prin metoda
  alpha-din-luminanță. Verifică vizual fiecare asset (nu publica un logo tăiat).
- Extrage 1–2 **decorații de brand** (colțuri, pattern-uri, iconuri) pentru straturile de fundal.
- Găsește/inline un **font condensat de display** apropiat de brand (dacă cel real e licențiat, folosește
  un proxy libre embed-uit ca data-URI) + un body grotesque.
- Optimizează totul (downscale + base64). Buget total embed ≤ ~700KB assets.

## Faza 2 — Fundație CSP-safe

Scheletul peste care se toarnă atmosfera:
- **Tokens de culoare** derivate din paleta cerută (`--bg`, gradient de accent, 2–3 neutre cu bias spre accent).
- **Tipografie** cu ierarhie clară (display condensat + body), inline.
- **Layout** — slide-uri full-viewport (click-driven cu fragmente) SAU scroll cinematic (scroll-snap). Vezi
  `references/technique-library.md` → „Navigation".
- **Straturi z** fixate: `canvas fundal (z0) → atmosferă (z1) → conținut/deck (z5) → chrome (z30) → flash (z3)`.
- Textul primește deja ierarhia și spacing-ul corect ACUM — pe el se construiește totul.

## Faza 3 — Atmosferă de fundal

Alege 1–2 sisteme ambientale (nu mai mult) din `references/technique-library.md`, potrivite vibe-ului:
câmp de particule (sprite), constelație neuronală (noduri + linii care pulsează la avans), panglică de aur
lichid, gradient mesh, grain/noise film (mix-blend, 0.03 opacitate — scoate sterilitatea digitală). Toate în
coloristica cerută, toate ≤ 0.14 opacitate sub text. Adaugă colțuri/decorații reale ca straturi de parallax faint.

## Faza 4 — Erou 3D + varietate per-scenă

Fiecare scenă importantă primește **un element viu distinct** (regula #5). De obicei **SVG line-art** în
gradientul de brand (rotații pe `transform-box:view-box` + `transform-origin` explicit — vezi library), sau
un obiect CSS 3D. Construiește-l la nivel de ilustrație tehnică reală, nu schematic: geometrie corectă,
ierarhie de grosimi de linie, glow subtil, umbră la sol, tilt 3D + plutire. *(Lecția: un vizual „schematic"
arată amatoricesc; unul cu detaliu real, componente corecte și ierarhie de linii arată ca artă.)*

## Faza 5 — Mișcare & interacțiune

- **Adâncime 3D lerp-uită:** `perspective` pe container, tilt la mouse pe planuri diferite, dar prin buclă
  rAF cu factor de lerp (~0.08), nu direct pe `pointermove` (altfel jitter).
- **Coregrafie la avans:** reveal secvențial al fragmentelor (chenarele apar pe rând la click), un **puls**
  care se propagă prin atmosferă (unda de constelație), un **flash** auriu subtil de tranziție (≤350ms, o dată).
- **Micro-interacțiuni:** magnetic cursor / hover pe controale, split-text stagger la titluri (opțional).
- Tot din `references/technique-library.md`. Fiecare animație trebuie să crească imersiunea fără să coste
  lizibilitatea sau FPS-ul.

## Faza 6 — LOOP-ul de calitate (aici se face opera de artă)

Nu livra prima variantă. Rulează bucla din `references/guardrails-and-loop.md`:
1. **Stress-test (premortem):** ce ar face varianta asta să pară amatoricească / obositoare / spartă? (logo
   tăiat, mișcare prea rapidă, text greu de citit, jitter, FPS mic, prea multe straturi simultan, efect care
   distrage). Notează fiecare defect.
2. **10x:** care lentilă are cel mai mare headroom acum — mai elegant, mai coerent, mai subtil, mai „scump"?
   Împinge acolo, nu peste tot.
3. **Regenerează** doar ce a picat. Repetă până trece checklist-ul gallery-grade.
4. **Verifică VIZUAL în browser** — screenshot pe fiecare scenă, confirmă lizibilitate + zero erori consolă +
   FPS OK. Doar ce trece de checklist pleacă mai departe.

## Faza 7 — Ship

Publică (Artifact / fișier). Enunță: coloristica păstrată, ce sistem de atmosferă + ce element per-scenă,
ce garduri de siguranță (reduced-motion, pauză pe tab ascuns, mobil), și mărimea fișierului. Oferă un reglaj
fin de intensitate (mai vizibil / mai discret) ca următorul pas.

---

## Referințe (progressive disclosure — încarcă la nevoie)

- **`references/technique-library.md`** — rețetarul complet, testat, CSP-safe: câmp de particule (sprite, nu
  shadowBlur), constelație neuronală cu puls, panglică lichidă, SVG line-art cu rotații corecte, tilt 3D lerp,
  grain, magnetic cursor, split-text, gradient mesh, frosted glass, navigare click/scroll. Citește-l la Fazele 3–5.
- **`references/asset-pipeline.md`** — extragerea assets-urilor reale (PDF/imagine → PNG transparent prin
  alpha-din-luminanță, split pe proiecție alpha, base64/data-URI, fonturi inline). Citește-l la Faza 1.
- **`references/guardrails-and-loop.md`** — praguri de psihologie a mișcării (viteze, opacități, densități,
  siguranță vestibulară), garduri de performanță & accesibilitate, lista de gotchas (bucla infinită etc.), și
  protocolul Loop-ului + checklist-ul gallery-grade. Citește-l la Fazele 5–6.

## Bara de calitate (fiecare livrare o trece)
Coloristica cerută păstrată exact · assets reale, niciodată recreate · text complet lizibil pe fiecare scenă ·
un element viu distinct pe fiecare scenă · mișcare calmă, max 2 straturi simultan + particule · zero CDN,
self-contained · `prefers-reduced-motion` + pauză pe tab ascuns + mobil ok · zero erori consolă · a trecut
Loop-ul, nu e prima variantă. Restrângerea e semnătura: mai puțin, dar impecabil.
