#!/usr/bin/env python3
# Free Supermemory - Wispr Flow transcript extractor. Python stdlib only.
# Reads the local Wispr Flow SQLite (History = dictations, Notes), groups
# dictations by day, writes markdown to data/wispr/. Read-only on a temp copy.
import sqlite3, shutil, tempfile, re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

SRC = Path.home() / "Library" / "Application Support" / "Wispr Flow" / "flow.sqlite"
OUT = Path(__file__).resolve().parent.parent / "data" / "wispr"
OUT.mkdir(parents=True, exist_ok=True)
if not SRC.exists():
    raise SystemExit(f"Wispr Flow DB not found at {SRC}")

# copy DB (+ wal/shm) to temp so we read a consistent snapshot without locking the app
tmp = Path(tempfile.mkdtemp())
db = tmp / "flow.sqlite"
for suf in ["", "-wal", "-shm"]:
    s = Path(str(SRC) + suf)
    if s.exists():
        shutil.copy(s, str(db) + suf)

con = sqlite3.connect(str(db))
con.row_factory = sqlite3.Row

def hm_of(ts):
    if not ts:
        return ""
    try:
        return datetime.fromisoformat(str(ts).replace("Z", "")).strftime("%H:%M")
    except Exception:
        return str(ts)[11:16]

rows = con.execute("""
  SELECT timestamp,
         app,
         COALESCE(NULLIF(editedText,''), NULLIF(formattedText,''), asrText) AS text
  FROM History
  WHERE COALESCE(NULLIF(editedText,''), NULLIF(formattedText,''), asrText) IS NOT NULL
    AND isArchived = 0
  ORDER BY timestamp
""").fetchall()

byday = defaultdict(list)
for r in rows:
    ts = r["timestamp"] or ""
    day = str(ts)[:10] if ts else "0000-00-00"
    app = (r["app"] or "?").split(".")[-1] or "?"
    txt = (r["text"] or "").strip()
    if txt:
        byday[day].append((hm_of(ts), app, txt))

n = 0
for day, items in sorted(byday.items()):
    out = [f"---", "source: wispr-flow", f"date: {day}", f"dictations: {len(items)}", "---", "",
           f"# Wispr Flow — dictări {day} ({len(items)})", ""]
    for hm, app, txt in items:
        out.append(f"**{hm}** · _{app}_  ")
        out.append(txt)
        out.append("")
    (OUT / f"wispr-{day}.md").write_text("\n".join(out))
    n += 1

# Notes (usually few)
notes = con.execute("SELECT title, content, createdAt FROM Notes WHERE isDeleted=0 AND content<>''").fetchall()
for nt in notes:
    title = (nt["title"] or "note").strip()
    safe = re.sub(r'[\\/:*?\"<>|]+', " ", title)[:70] or "note"
    (OUT / f"note-{safe}.md").write_text(
        f"---\nsource: wispr-flow-note\ntitle: {title!r}\n---\n\n# {title}\n\n{nt['content']}\n")

con.close()
shutil.rmtree(tmp, ignore_errors=True)
print(f"Wispr Flow: {len(rows)} dictations -> {n} day-files + {len(notes)} notes in {OUT}")
