#!/usr/bin/env python3
# Free Supermemory - TwinMind transcript ingester.
# Reads a twinmind-export.json (produced from app.twinmind.com via the browser) and
# writes one markdown note per call into data/twinmind/. Then run build-index.mjs.
import json, re, sys
from pathlib import Path

SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.home() / "Downloads" / "twinmind-export.json"
OUT = Path(__file__).resolve().parent.parent / "data" / "twinmind"
OUT.mkdir(parents=True, exist_ok=True)
if not SRC.exists():
    raise SystemExit(f"Not found: {SRC}")

data = json.load(open(SRC))

def slug(s):
    return (re.sub(r'[\\/:*?"<>|]+', " ", str(s or "memory")).strip()[:70] or "memory")

def astext(v):
    if v is None:
        return ""
    if isinstance(v, list):
        if all(not isinstance(x, (dict, list)) for x in v):
            return ", ".join(str(x) for x in v)
        return json.dumps(v, ensure_ascii=False, indent=1)
    if isinstance(v, dict):
        return json.dumps(v, ensure_ascii=False, indent=1)
    return str(v)

n = 0
seen = set()
for m in data:
    if not isinstance(m, dict) or m.get("error"):
        continue
    title = m.get("title") or "TwinMind memory"
    date = (m.get("start") or "")[:10] or "0000-00-00"
    base = f"{date}-{slug(title)}"; fn = f"{base}.md"; k = 2
    while fn in seen:
        fn = f"{base}-{k}.md"; k += 1
    seen.add(fn)
    out = ["---", "source: twinmind", f"meeting_id: {m.get('id','')}",
           f"title: {json.dumps(title, ensure_ascii=False)}", f"date: {date}", "---", "",
           f"# {title}", "", f"_TwinMind call · {date}_", ""]
    att = astext(m.get("attendees")); kw = astext(m.get("keywords"))
    if att:
        out.append(f"**Attendees:** {att}  ")
    if kw:
        out.append(f"**Keywords:** {kw}")
    out.append("")
    if m.get("summary"):
        out += ["## Summary", astext(m["summary"]), ""]
    if m.get("action"):
        out += ["## Action items", astext(m["action"]), ""]
    if m.get("transcript"):
        out += ["## Transcript", astext(m["transcript"]), ""]
    (OUT / fn).write_text("\n".join(out))
    n += 1

print(f"TwinMind: {n} memories -> {OUT}")
