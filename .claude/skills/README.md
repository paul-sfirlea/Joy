# Skills — index

Toate skill-urile agenției și ale lui Paul, într-un singur loc. Fiecare folder
conține un `SKILL.md` (instrucțiunile) plus, opțional, scripturi și referințe.

## Cum le folosești
- **În Claude Code (acest proiect):** sunt active automat; se declanșează după
  descriere sau le invoci cu `/nume-skill`.
- **În claude.ai (Magda/Virgil):** Settings → Skills → upload folderul ca ZIP.
- **Pe Mac:** `cp -r .claude/skills/* ~/.claude/skills/`.

## Skill-urile

| Skill | Ce face | Trigger tipic |
|---|---|---|
| **amplify** | Meta-skill: găsește capabilitatea potrivită, amplifică prompturi (3DP), te învață și personalizează pe contextul tău | „amplifică promptul", „cu ce fac X?" |
| **content-factory** | Fabrica de postări a agenției (metodologia Magda): plan lunar + postări (statice/carusele/reels) + quality gate 10/10 + CSV Publer | „fă planul lunii pentru clientul X" |
| **dashboard-architect** | Construiește dashboard-uri interactive într-un singur fișier HTML (rapoarte de campanie, KPI), brand-ready, print/PDF | „fă-mi un dashboard de campanie" |
| **elearning-architect** | Construiește cursuri e-learning complete (one-pager → platformă cu login/progres/certificare), cu tehnici de învățare reale | „fă-mi un e-learning despre X" |
| **recipe-architect** | Motor de bar-program: rețete cocktail/food cu copy de meniu, fișă de prep și Excel de profitabilitate (format Diageo) | „fă-mi un cocktail", „construiește un meniu" |
| **llm-council** | Trece o decizie prin 5 consilieri AI care analizează independent, se peer-review-uiesc și sintetizează un verdict | „council this", „pressure-test this" |
| **clipify** | Găsește momentele bune dintr-un video, le taie ca clipuri, reframe 16:9→9:16, captions word-by-word | „cut clips from this", „fă shorts" |
| **transcribe-video** | Transcript de mare acuratețe din orice video/audio → .md + .srt + .txt (whisper-large-v3-turbo) | „transcrie video-ul", „scoate transcriptul" |
| **supermemory** | Orchestrator de memorie local-first: recall în Second Brain, fișiere, notițe, mail, chat-uri. **Datele rămân pe Mac, nu în repo.** | „recall", „ce știu despre" |

## Note
- **supermemory**: aici e doar „creierul" (instrucțiuni + scripturi). Arhiva
  personală (`data/`) rămâne local pe Mac — nu se urcă în repo (date sensibile).
  `config.json` conține căi locale de pe mașina lui Paul; rescrie-le la nevoie.
- Skill-urile cu scripturi (`clipify`, `recipe-architect`, `transcribe-video`,
  `supermemory`) au nevoie de dependențele lor instalate ca să ruleze efectiv
  partea de cod; instrucțiunile funcționează oricum.
