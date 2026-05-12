import { ModuleDefinition } from './types';
import { baseSystemInstruction, venueContext, outputContract } from './shared';
import { VenueInput } from '../types';

const sys = (input: VenueInput) =>
  baseSystemInstruction + venueContext(input) + outputContract;

const PRO_MODEL = 'gemini-3-pro-preview';

export const MODULE_REGISTRY: ModuleDefinition[] = [
  // ═══════════════════ REPUTATION ═══════════════════
  {
    id: 'identity-audit',
    label: 'Identitate & Locație',
    tagline: 'Adresă exactă, brand, semnale roșii',
    category: 'reputation',
    icon: '📍',
    priority: 1,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Verifică identitatea și localizarea exactă a "${input.name}" din "${input.city}".

Caută: Google Maps, site oficial, profil Google Business.

În "Headline" spune adresa exactă (mall/zonă/cartier).
În "Trei Fapte" pune: (1) range de preț real verificat, (2) ce categorie reală reiese din recenzii, (3) red flag identificat (ex: profil incomplet, recenzii vechi, site lipsă).
În "Trei Mișcări" pune acțiuni de fixare a celor mai mari găuri de identitate online.
`,
  },

  {
    id: 'online-reputation',
    label: 'Reputație Online',
    tagline: 'Google, TripAdvisor, sentiment, bleeding points',
    category: 'reputation',
    icon: '⭐',
    priority: 2,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Analizează reputația "${input.name}" din "${input.city}" pe Google Reviews, TripAdvisor, Yelp, Foursquare, Facebook.

În "Headline" sintetizează status-ul reputației într-o propoziție brutală.
În "Trei Fapte" pune: (1) rating Google + nr recenzii + tendință, (2) rating TripAdvisor + poziție în clasament local, (3) cea mai frecventă plângere cu citat scurt între ghilimele.
În "Trei Mișcări" pune acțiuni de oprit "sângerarea" reputațională chiar săptămâna asta.
`,
  },

  {
    id: 'social-pulse',
    label: 'Puls Social Media',
    tagline: 'Instagram, TikTok, Facebook — engagement & UGC',
    category: 'reputation',
    icon: '📱',
    priority: 3,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Evaluează prezența "${input.name}" din "${input.city}" pe Instagram, TikTok, Facebook.

Caută: site:instagram.com, site:tiktok.com, site:facebook.com cu numele localului, hashtag-uri locale relevante.

În "Headline" spune cât de sănătoasă e prezența socială (de la "inexistentă" la "world-class").
În "Trei Fapte" pune: (1) Instagram followers + frecvență post + engagement rate estimat, (2) prezență TikTok (Da/Nu + activitate), (3) tipul de UGC organic (clienții postează? cu ce hashtag?).
În "Trei Mișcări" pune acțiuni concrete de creștere socială (format + frecvență + platformă).
`,
  },

  {
    id: 'digital-footprint',
    label: 'Amprentă Digitală & SEO',
    tagline: 'Site, Google Business, OTAs, booking, delivery',
    category: 'reputation',
    icon: '🌐',
    priority: 4,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Audit al infrastructurii digitale a "${input.name}" dincolo de social.

Verifică: site oficial, Google Business profile, prezență pe Booking.com / TheFork / Glovo / Bolt Food / Tazz (după caz).

În "Headline" spune cât de "discoverable" e localul digital.
În "Trei Fapte" pune: (1) status site oficial (există? mobile? rezervări?), (2) status Google Business (complet? răspunde la recenzii?), (3) prezență pe platforme terțe relevante (delivery/booking/OTA).
În "Trei Mișcări" pune cele mai mari găuri digitale de astupat ASAP.
`,
  },

  // ═══════════════════ MARKET ═══════════════════
  {
    id: 'local-competition',
    label: 'Concurența în Zonă',
    tagline: 'Competitori direcți, prețuri, gap-uri exploatabile',
    category: 'market',
    icon: '⚔️',
    priority: 5,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Cartografiază concurența REALĂ pentru "${input.name}" — doar localuri din aceeași zonă/cartier/mall pe care un client le-ar lua în considerare în loc.

În "Headline" identifică principalul competitor + în ce dimensiune e mai puternic.
În "Trei Fapte" pune 3 competitori reali (nume real) cu: rating Google, range preț, slăbiciunea exploatabilă (citat din review-uri negative).
În "Trei Mișcări" pune acțiuni concrete de "furt de clienți" — cum exploatezi slăbiciunile competitorilor.
`,
  },

  {
    id: 'customer-personas',
    label: 'Personas & Segmente',
    tagline: 'Cine vine, cine NU vine, ce segment ratezi',
    category: 'market',
    icon: '👥',
    priority: 6,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Identifică personas-ul de client al "${input.name}" și segmentele neexploatate.

Caută: cine apare în pozele clienților pe Instagram, ce profil au cei care lasă recenzii, demografie zona.

În "Headline" descrie persona-ul DOMINANT actual într-o frază.
În "Trei Fapte" pune: (1) cine vine acum (persona + când + cât cheltuie), (2) cine NU vine deși zona îi conține (segment ratat), (3) cel mai mare segment neexploatat cu potențial de revenue.
În "Trei Mișcări" pune acțiuni de atragere a segmentului neexploatat (meniu/preț/comunicare).
`,
  },

  {
    id: 'city-pulse',
    label: 'Pulsul Orașului',
    tagline: 'Economie, turism, demografie, trafic local',
    category: 'market',
    icon: '🏙️',
    priority: 7,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Sintetizează forțele macro din "${input.city}" care influențează direct cererea pentru un ${input.venueType}.

Caută: salariu mediu local, profil turistic, dezvoltări imobiliare/business hub-uri din zonă, sezonalitate.

În "Headline" spune dacă piața e în creștere / stagnare / scădere pentru ${input.venueType}.
În "Trei Fapte" pune: (1) salariu mediu + putere de cumpărare zonă, (2) profil turistic dominant (origine + sezonalitate), (3) o dezvoltare/schimbare relevantă din zonă în următoarele 12 luni.
În "Trei Mișcări" pune cum se aliniază "${input.name}" cu trendul macro.
`,
  },

  {
    id: 'events-calendar',
    label: 'Calendar Evenimente (90 zile)',
    tagline: 'Festivaluri, concerte, conferințe → trafic',
    category: 'market',
    icon: '📅',
    priority: 8,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Identifică evenimente reale din "${input.city}" în următoarele 90 de zile care pot genera trafic pentru "${input.name}".

Caută: festivaluri, concerte mari, conferințe, târguri, evenimente sportive — cu date specifice.

În "Headline" numește evenimentul cu cel mai mare impact previzibil + data.
În "Trei Fapte" pune 3 evenimente concrete cu: nume + dată + profil public + distanță față de local.
În "Trei Mișcări" pune pentru fiecare eveniment major: cum se pregătește "${input.name}" (meniu special / ore extinse / parteneriat).
`,
  },

  {
    id: 'geopolitical-regulatory',
    label: 'Reglementări & Risc Macro',
    tagline: 'Taxe, regulamente HoReCa, riscuri 12 luni',
    category: 'market',
    icon: '⚖️',
    priority: 9,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Identifică reglementări și forțe macro care afectează un ${input.venueType} din "${input.city}", România, în următoarele 12 luni.

Caută: TVA, e-Factura, SAF-T, salariu minim, reguli locale program/alcool/terase, fluxuri turistice afectate de geopolitică.

În "Headline" numește riscul #1 regulator pe 12 luni.
În "Trei Fapte" pune: (1) o reglementare recentă/iminentă cu impact direct + deadline, (2) un cost macro în creștere (energie/salarii/aprovizionare) cu cifre, (3) o oportunitate regulatorie (grant/fond/schemă).
În "Trei Mișcări" pune acțiuni defensive concrete pentru top riscuri.
`,
  },

  // ═══════════════════ STRATEGY ═══════════════════
  {
    id: 'global-trends',
    label: 'Trenduri Globale Aplicabile',
    tagline: 'Concepte câștigătoare internațional, importabile aici',
    category: 'strategy',
    icon: '🌍',
    priority: 10,
    buildSystemInstruction: sys,
    buildPrompt: (input) => `
TASK: Identifică 3 trenduri globale 2025-2026 din ${input.venueType}-uri de top (NYC, Londra, Paris, Tokyo, Copenhagen) care ar funcționa la "${input.name}" din "${input.city}".

În "Headline" numește cel mai puternic trend + de ce se aplică AICI.
În "Trei Fapte" pune 3 trenduri specifice — fiecare cu: nume trend + un exemplu real (brand internațional) + de ce e relevant pentru "${input.city}".
În "Trei Mișcări" pune cum se adoptă fiecare trend în "${input.name}" cu efort/cost minim.
`,
  },

  {
    id: 'strategic-synthesis',
    label: 'Sinteză Strategică',
    tagline: 'SWOT condensat + 3 mișcări care contează cel mai mult',
    category: 'strategy',
    icon: '♟️',
    priority: 11,
    model: PRO_MODEL,
    thinkingBudget: 6000,
    buildSystemInstruction: (input) =>
      baseSystemInstruction +
      venueContext(input) +
      `
CONTRACT DE OUTPUT — FORMAT SPECIAL PENTRU ACEST MODUL:

### 🎯 Headline
[Bottom-line-ul strategic în 1 propoziție. Max 25 cuvinte.]

### ♟️ SWOT Condensat (1 linie fiecare)
- **💪 Forța #1:** [punct forte cu evidență]
- **🩹 Slăbiciunea #1:** [punct slab cu evidență]
- **🚀 Oportunitatea #1:** [oportunitate cu sursă]
- **⚠️ Amenințarea #1:** [risc cu probabilitate × impact]

### 🎯 Trei Mișcări Strategice
1. **[Verb imperativ + acțiune]** — Logica: [exploatează S×O / neutralizează W×O / apară S×T]. Cost: [estimare]. KPI 90 zile: [cifră concretă].
2. **[Verb imperativ + acțiune]** — Logica. Cost. KPI.
3. **[Verb imperativ + acțiune]** — Logica. Cost. KPI.

STOP. Nimic după "Trei Mișcări".
`,
    buildPrompt: (input) => `
TASK: Sinteză strategică pentru "${input.name}", ${input.venueType} din "${input.city}".

Fiecare punct SWOT trebuie să aibă DOVADĂ verificabilă (citat de recenzie, cifră de piață, observație factuală). Zero platitudini.

Cele 3 mișcări trebuie să fie SPECIFICE și prioritizate brutal — fără "îmbunătățește marketingul". Format: [Verb] + [acțiune concretă] + KPI numeric pe 90 de zile.
`,
  },
];

export const getModulesByCategory = () => {
  const groups: Record<string, ModuleDefinition[]> = {};
  for (const mod of MODULE_REGISTRY) {
    if (!groups[mod.category]) groups[mod.category] = [];
    groups[mod.category].push(mod);
  }
  for (const cat in groups) {
    groups[cat].sort((a, b) => a.priority - b.priority);
  }
  return groups;
};
