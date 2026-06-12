---
name: supermemory
description: >-
  Paul's free, local-first memory orchestrator — his private "supermemory" (a
  zero-cost replacement for the paid claude-supermemory plugin). Use to RECALL
  anything Paul knows across his Second Brain (Obsidian V3), his laptop work
  files (~5k PDFs / Keynote / decks / docs), Apple Notes, Google Drive, Gmail,
  Calendar, past Claude Code sessions, and his imported ChatGPT/Claude chat
  history; to SAVE durable facts ("super-save"); or to REFRESH the local index.
  Triggers RO: "supermemory", "recall", "ce știu despre", "ce am scris despre",
  "caută în memoria mea", "caută în second brain", "unde am fișierul/deck-ul",
  "ce keynote am despre", "ține minte că", "salvează în memorie", "ce am lucrat
  la", "adu-mi contextul despre". Triggers EN: "what do I know about", "search my
  brain / notes / files / memory", "which deck / keynote about", "recall",
  "remember this", "save to memory", "what did I work on". NOT for writing new
  content notes — this skill only searches and saves. Runs entirely on Paul's
  machine plus his already-connected MCP connectors; nothing is uploaded to any
  paid memory cloud.
---

# Supermemory (free, local-first)

Paul's private memory layer — **super-search** + **super-save** across his whole
knowledge surface, for **$0**, **locally**, orchestrated by Claude. Nothing
leaves his Mac unless he explicitly queries an external connector (Drive / Gmail
/ Calendar), and those are read-only.

## Data files (under `~/.claude/skills/supermemory/`)

| File | What |
|---|---|
| `data/INDEX.md` | Rich routing map of **text notes** (title/summary/tags). Read FIRST for personal knowledge. |
| `data/FILES.md` | **Folder map of binary files** (PDF, Keynote, PPTX, docx…). Find the folder, then grep manifest. |
| `data/manifest.json` | Full catalog of everything (grep this for an exact filename/path). |
| `data/chats/` | Imported ChatGPT/Claude conversations (after export → ingest). |
| `data/apple-notes/` | Optional offline snapshot of Apple Notes (secrets excluded). |
| `scripts/build-index.mjs` | Rebuild the index. `config.json` = which roots. |
| `scripts/ingest-chats.mjs` | Import a ChatGPT/Claude `conversations.json`. |
| `scripts/export-apple-notes.mjs` | Snapshot Apple Notes to markdown. |
| Durable saved facts | `~/.claude/projects/-Users-Sfirlea-Documents-NEW-LAPTOP-Vaults/memory/` (+ `MEMORY.md`). |

## Source map — what to query for what

Load deferred MCP schemas on demand via ToolSearch (e.g. `"google drive search"`, `"gmail search threads"`, `"apple notes"`, `"session transcripts"`).

| Source | Use when | How |
|---|---|---|
| **Second Brain V3 notes** | frameworks, decisions, projects Paul wrote | Read `INDEX.md` → Read/Grep the note `path` |
| **Laptop work files** (PDF/Keynote/decks/docs) | "where's my deck/PDF/keynote about X" | Read `FILES.md` for the folder → grep `manifest.json` for the name → extract on demand (below) |
| **Apple Notes** | quick captures, prompts, client/finance notes | Apple Notes MCP: `list_notes` → `get_note_content` (live), or the offline snapshot if present |
| **Google Drive** | decks/docs in Drive (reads inside Google Slides) | Drive MCP: `search_files` → `read_file_content` |
| **Gmail** | what was said/agreed over email | Gmail MCP: `search_threads` → `get_thread` |
| **Calendar** | when something is scheduled | Calendar MCP: `list_events` |
| **Past Claude Code sessions** | "what did we build together before" | `ccd_session_mgmt`: `search_session_transcripts` (needs Paul's approval click) |
| **ChatGPT / Claude.ai chats** | older thinking saved in chat history | imported notes under `data/chats/` (Read/Grep) |

## Converting binary files to Markdown (MarkItDown)

The index lists binary files by name/folder. To make their **content** searchable, convert them to `.md` with the bundled converter (powered by MarkItDown, installed at `~/.local/bin/markitdown`):

```bash
node "/Users/Sfirlea/.claude/skills/supermemory/scripts/to-markdown.mjs" "<file-or-folder>"
node "/Users/Sfirlea/.claude/skills/supermemory/scripts/build-index.mjs"   # then reindex
```

- Native: **PDF, PPTX, DOCX, XLSX, CSV, HTML, images (OCR/EXIF), audio**.
- **Keynote / Pages / Numbers**: auto-exported to PDF first via osascript (needs the iWork apps + a one-time Automation approval).
- Output lands in `data/converted/` and is indexed as the "Converted (file→md)" root, so it becomes full-text recall.
- Image-only / scanned PDFs extract little text — for those, pass `markitdown` an LLM, or use the `pdf` skill's OCR. Video isn't supported → use the `transcribe-video` skill.
- For a one-off quick read without saving, `pdftotext "file.pdf" -` or `markitdown "file.pptx"` also work.

## MODE 1 — RECALL (default)

1. For personal knowledge, **start with `INDEX.md`**; for a file/deck, **start with `FILES.md` + grep `manifest.json`**.
2. Read the strongest candidates; extract binary content on demand.
3. Add external sources (Drive/Gmail/Calendar/Notes/sessions/chats) only when the question implies them.
4. Answer directly and **cite every source** (clickable path/link). Separate notes vs files vs Drive vs email vs chat.
5. Offer to SAVE the distilled result (MODE 2) when worth keeping.

## MODE 2 — SAVE ("super-save")

Persist to the **MEMORY.md system** (not the vault). Use the memory-file format:
frontmatter `name` / `description` / `metadata.type` (`user|feedback|project|reference`),
the fact in the body, `[[links]]` to related memories, and a one-line pointer in
`MEMORY.md`. Confirm in one sentence.

## MODE 3 — REFRESH / IMPORT

```bash
node "/Users/Sfirlea/.claude/skills/supermemory/scripts/build-index.mjs"            # rebuild index
node "/Users/Sfirlea/.claude/skills/supermemory/scripts/ingest-chats.mjs" <export>  # import ChatGPT/Claude export, then rebuild
node "/Users/Sfirlea/.claude/skills/supermemory/scripts/to-markdown.mjs" <file|dir>  # convert PDF/PPT/Keynote/image → md, then rebuild
node "/Users/Sfirlea/.claude/skills/supermemory/scripts/export-apple-notes.mjs"     # snapshot Apple Notes, then rebuild
```

## Privacy

Local-first. The vault and files never leave the Mac. External connectors are
read-only and only touched when needed. The Apple Notes snapshot **excludes
notes whose title looks like a secret** (credentials/keys/passwords/IBAN). Safe
for Diageo/client-sensitive material.

## Extending coverage

Edit `config.json` → set a root `enabled: true` (e.g. `Downloads`, `AI Hacker
Pro`) → REFRESH. V2/OLD vaults stay OFF (duplicates). `Vaults` is in
`excludeDirs` so the work-files root doesn't re-index the Obsidian vault.
