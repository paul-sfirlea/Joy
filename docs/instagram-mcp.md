# Instagram MCP — analiză & reverse engineering de reels/carusele

Acest ghid configurează un server MCP (Model Context Protocol) prin care Claude Code
poate extrage și analiza reels și carusele de pe Instagram, ca să le poți „reverse
engineer": structură, hook, ritm, copy, CTA, format vizual.

Sursa de date este **Apify** (actor-ul `apify/instagram-scraper`). Apify rezolvă
partea grea — extragerea conținutului public — și returnează JSON structurat (caption,
hashtag-uri, URL-uri de video/imagini, metrici, comentarii). Restul (analiza propriu-zisă)
o face modelul.

> ⚠️ Notă legală: extragerea conținutului altcuiva intră în zona gri a Termenilor
> Instagram. Folosește asta pentru analiză / cercetare de conținut, nu pentru
> republicare. Conținutul rămâne al autorului.

---

## 1. Ce ai nevoie

1. **Cont Apify** (gratuit la start): https://console.apify.com/sign-up
   Planul free vine cu ~$5 credit lunar, suficient pentru câteva mii de postări.
2. **Token API Apify**: în consolă → `Settings` → `Integrations` → `Personal API tokens`.
3. **Node.js** instalat local (pentru `npx`).

### Cost orientativ
Actor-ul `apify/instagram-scraper` costă aproximativ **$1.50 / 1000 rezultate**
(~$0.0015 per postare). Pentru reverse-engineering analizezi 5–50 de postări odată,
deci costul e neglijabil (cenți).

---

## 2. Configurarea tokenului

Serverul MCP citește tokenul din variabila de mediu `APIFY_TOKEN` — nu îl punem
niciodată direct în `.mcp.json` (care e comis în git).

Adaugă în profilul shell-ului tău (`~/.zshrc`, `~/.bashrc` etc.):

```bash
export APIFY_TOKEN="apify_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

Apoi redeschide terminalul (sau `source ~/.zshrc`) înainte să pornești Claude Code.

---

## 3. Cum e conectat (deja făcut)

Fișierul [`.mcp.json`](../.mcp.json) din rădăcina proiectului declară serverul:

```json
{
  "mcpServers": {
    "apify-instagram": {
      "command": "npx",
      "args": ["-y", "@apify/actors-mcp-server", "--actors", "apify/instagram-scraper"],
      "env": { "APIFY_TOKEN": "${APIFY_TOKEN}" }
    }
  }
}
```

La prima pornire a Claude Code în acest folder, ți se va cere să aprobi serverul MCP
(`/mcp` arată statusul). Verifică să apară `apify-instagram` ca `connected`.

### Alternativă: serverul hosted (fără Node/npx)
Dacă preferi varianta găzduită de Apify (transport Streamable HTTP, recomandată oficial),
înlocuiește blocul din `.mcp.json` cu:

```json
{
  "mcpServers": {
    "apify-instagram": {
      "type": "http",
      "url": "https://mcp.apify.com/?actors=apify/instagram-scraper",
      "headers": { "Authorization": "Bearer ${APIFY_TOKEN}" }
    }
  }
}
```

---

## 4. Cum extragi un reel sau un carusel

Actor-ul acceptă URL-uri directe. Inputul tipic:

```json
{
  "directUrls": [
    "https://www.instagram.com/reel/Cxxxxxxxxxx/",
    "https://www.instagram.com/p/Cyyyyyyyyyy/"
  ],
  "resultsType": "posts",
  "resultsLimit": 50,
  "addParentData": false
}
```

Sau pe profil întreg (ultimele N postări ale unui cont):

```json
{
  "username": ["numele_contului"],
  "resultsType": "posts",
  "resultsLimit": 24
}
```

Câmpuri utile din răspuns: `caption`, `hashtags`, `mentions`, `videoUrl`,
`displayUrl` / `images` (pentru fiecare slide de carusel), `videoViewCount`,
`likesCount`, `commentsCount`, `videoDuration`, `type` (Image / Video / Sidecar).
`Sidecar` = carusel.

---

## 5. Playbook de reverse-engineering

Odată conectat MCP-ul, dă-i lui Claude/Gemini un prompt de forma de mai jos. Tu
schimbi doar URL-ul.

### Pentru un REEL

> Extrage reel-ul `<URL>` cu actor-ul Apify de Instagram, apoi fă reverse-engineering:
>
> 1. **Hook (primele 3 secunde)** — ce promisiune/tensiune deschide? Vizual + text on-screen.
> 2. **Structură narativă** — împarte pe secțiuni (hook → context → demonstrație → payoff → CTA) cu timing aproximativ din `videoDuration`.
> 3. **Copy** — analizează caption-ul: hook scris, formatare, hashtag strategy, CTA.
> 4. **Mecanisme de retenție** — loop, pattern interrupt, text kinetic, ritm de tăieturi.
> 5. **De ce a performat** — corelează `videoViewCount` / `likesCount` / `commentsCount` cu elementele de mai sus.
> 6. **Template replicabil** — dă-mi un schelet pe care îl pot refolosi pentru brandul meu HoReCa, cu exemplu concret.

### Pentru un CAROUSEL

> Extrage caruselul `<URL>` (type `Sidecar`), apoi:
>
> 1. **Slide 1 (cover)** — hook vizual + text. De ce oprește scroll-ul?
> 2. **Arhitectura slide-urilor** — rolul fiecărui slide (problemă → escaladare → soluție → dovadă → CTA).
> 3. **Design system** — paletă, tipografie, layout repetitiv, branding.
> 4. **Copy & micro-copy** — text per slide + caption-ul lung.
> 5. **CTA & mecanism de salvare** — ce îl face „save-able" / „share-able".
> 6. **Template replicabil** — structură slide-cu-slide pentru un carusel echivalent în nișa mea.

### Analiză competitivă (mai multe postări)

> Extrage ultimele 20 de postări de la `@cont_concurent`, grupează-le pe formate
> (reel / carusel / single), și dă-mi: formatele lor cu cel mai bun engagement,
> hook-urile recurente, cadența de postare și 3 idei pe care le pot „fura ca un artist".

---

## 6. Limitări de știut

- Apify extrage **conținut public**. Conturile private nu sunt accesibile.
- Pentru analiza vizuală fină (text on-screen, montaj cadru-cu-cadru) ai nevoie de un
  model multimodal care să „vadă" video-ul/imaginile de la `videoUrl`/`displayUrl`.
  Claude și Gemini pot procesa imaginile de la `displayUrl`; pentru video, descarcă-l
  și extrage cadre cheie sau analizează slide-urile statice.
- Instagram își schimbă periodic structura; actor-ul Apify e întreținut, dar dacă o
  extragere eșuează, verifică pagina actor-ului pentru update-uri.
