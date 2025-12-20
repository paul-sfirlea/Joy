import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVenue = async (venueName: string, city: string): Promise<string> => {
  const systemInstruction = `
Ești un Consultant de Elită în industria Ospitalității (HoReCa). 
Ai o sarcină CRITICĂ: Să nu greșești niciodată locația fizică.

Context: Utilizatorul a raportat erori în trecut (ex: Uchio pus pe str. Uliului în loc de Iulius Mall). 
TREBUIE SĂ VERIFICI ADRESA EXACTĂ ÎNAINTE DE ORICE ANALIZĂ.

Obiectiv: Analizează locația "${venueName}" din "${city}".

URMEAZĂ ACEȘTI 6 PAȘI STRICT. Folosește separatorul exact "===STEP [număr]===" înainte de fiecare pas.

PASUL 1: VERIFICARE LOCAȚIE & REPUTAȚIE DIGITALĂ (CRUCIAL)
- **Locația Exactă:** Folosește Google Search pentru a găsi adresa precisă. E în Mall? E în Centrul Vechi? E într-un Business Park? 
- *Atenție:* Dacă găsești mai multe locații cu nume similar, alege-o pe cea mai relevantă din orașul specificat și menționează cartierul/zona.
- **Feeling-ul Digital:** Ce "vibe" transmite online? E premium, e kitsch, e neglijat?
- **Reputație & Sfaturi Imediate:** Ce spun oamenii (Recenzii Google/TripAdvisor)? Care sunt cele mai mari plângeri? Oferă 3 sfaturi concrete pentru a repara imaginea online ACUM.

PASUL 2: IDENTIFICAREA CONCURENȚEI (ZONĂ VERIFICATĂ)
Acum că știi exact unde e (ex: Iulius Mall), caută concurența RELEVANTĂ din acea zonă specifică.
- Nu da concurenți din celălalt capăt al orașului decât dacă sunt destinații de top.
- Dacă e în Mall, concurența e Food Court-ul sau restaurantele din jur.
- Listează 5-6 competitori reali și explică de ce sunt competitori (Proximitate vs Concept).

PASUL 3: EXTRAGEREA DATELOR PROFUNDE & AMPLIFICAREA PUNCTELOR SLABE
Analizează competitorii găsiți la Pasul 2:
- **Ce fac bine:** De ce merg clienții la ei?
- **PUNCTE SLABE (The Kill Zone):** Caută recenziile lor negative. Ce îi enervează pe clienții lor? (ex: "La X se așteaptă mult", "La Y mâncarea e fadă").
- Fii specific. Vrem să știm exact unde sângerează concurența.

PASUL 4: GLOBAL BENCHMARKING
Compară oferta din zona respectivă cu trendurile globale.
- Ce lipsește din acest cartier/zonă/mall care ar rupe gura târgului?
- Oportunitate "Blue Ocean": Ce concept nu există în zonă?

PASUL 5: SINTEZA STRATEGICĂ & SWOT
Analiză SWOT focusată pe realitatea fizică a locației:
- Strengths: Ce avantaj le dă locația (ex: parcare mall, trafic pietonal)?
- Weaknesses: Ce dezavantaj au (ex: chirie mare, zgomot, lipsă intimitate)?
- Opportunities & Threats din piața locală.

PASUL 6: STRATEGIA DE ATAC "GODLIKE" (FURT DE CLIENȚI)
Cum luăm clienții de la competitorii identificați la Pasul 2?
- **Strategii de Monetizare a Slăbiciunilor:** Dacă competitorul din Mall e scump, noi facem meniu de prânz imbatabil. Dacă competitorul e lent, noi garantăm viteza.
- **Idei de Promovare:** Postări și campanii care lovesc în punctele slabe ale vecinilor (subtil, dar eficient).

TON: Extrem de sigur pe locație (verifică de 2 ori), Strategic, Actionabil.
Formatează cu Markdown. Folosește Bolding pentru accent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Analizează locația ${venueName} din orașul ${city}. VERIFICĂ ADRESA EXACTĂ. Dacă e în Mall, spune că e în Mall.` }]
        }
      ],
      config: {
        systemInstruction,
        thinkingConfig: {
          thinkingBudget: 16000, // Budget for confirming location and deep analysis
        },
        tools: [{ googleSearch: {} }], // Grounding is mandatory
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Nu s-a putut genera analiza. Încearcă din nou.");
    }
    return text;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "A apărut o eroare la conectarea cu consultantul AI.");
  }
};