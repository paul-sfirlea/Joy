#!/usr/bin/env python3
"""Convert a whisper JSON transcript into three deliverables:

  <base>.md   — paragraphs with [mm:ss] timestamps + metadata header
  <base>.srt  — standard SRT cues (one per whisper segment)
  <base>.txt  — clean prose, no timestamps, paragraph-broken

Usage:
  build_outputs.py WHISPER.json BASE_PATH [--source PATH] [--model NAME]
                   [--gap SECONDS] [--max-para SECONDS]

  BASE_PATH is the output path without extension. .md/.srt/.txt are appended.
"""
import json, sys, os, argparse, datetime

def fmt_mmss(t):
    m = int(t // 60); s = int(t - m*60)
    return f"{m:02d}:{s:02d}"

def fmt_srt(t):
    h = int(t // 3600); m = int((t % 3600) // 60)
    s = int(t - h*3600 - m*60); ms = int(round((t - int(t)) * 1000))
    if ms == 1000: s += 1; ms = 0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def group_paragraphs(segs, gap_thresh, max_para_dur):
    """Group segments into paragraphs broken by silence > gap or by max duration."""
    paragraphs = []
    cur = []
    para_start = segs[0]["start"]
    for s in segs:
        if cur:
            prev_end = cur[-1]["end"]
            gap = s["start"] - prev_end
            para_dur = s["end"] - para_start
            if gap > gap_thresh or para_dur > max_para_dur:
                paragraphs.append((para_start, cur))
                cur = []
                para_start = s["start"]
        cur.append(s)
    if cur:
        paragraphs.append((para_start, cur))
    return paragraphs

def write_md(out_path, paragraphs, total_dur, source, model, language):
    total_m = int(total_dur // 60); total_s = int(total_dur - total_m*60)
    lines = []
    title = os.path.basename(source) if source else "Transcript"
    lines.append(f"# Transcript — {title}\n")
    if source:
        lines.append(f"**Source:** `{source}`  ")
    lines.append(f"**Duration:** {total_m}:{total_s:02d} ({total_dur:.0f}s)  ")
    lines.append(f"**Model:** {model}  ")
    lines.append(f"**Language:** {language}  ")
    lines.append(f"**Generated:** {datetime.date.today().isoformat()}\n")
    lines.append("---\n")
    lines.append("## Transcript\n")
    for start, group in paragraphs:
        text = " ".join(" ".join(s["text"].strip().split()) for s in group)
        lines.append(f"**[{fmt_mmss(start)}]** {text}\n")
    with open(out_path, "w") as f:
        f.write("\n".join(lines) + "\n")

def write_srt(out_path, segs):
    with open(out_path, "w") as f:
        for i, s in enumerate(segs, 1):
            text = " ".join(s["text"].strip().split())
            f.write(f"{i}\n{fmt_srt(s['start'])} --> {fmt_srt(s['end'])}\n{text}\n\n")

def write_txt(out_path, paragraphs):
    with open(out_path, "w") as f:
        for _, group in paragraphs:
            text = " ".join(" ".join(s["text"].strip().split()) for s in group)
            f.write(text + "\n\n")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("whisper_json")
    ap.add_argument("base_path", help="output base path (no extension)")
    ap.add_argument("--source", default="")
    ap.add_argument("--model", default="whisper-large-v3-turbo")
    ap.add_argument("--gap", type=float, default=1.5)
    ap.add_argument("--max-para", type=float, default=45.0)
    args = ap.parse_args()

    data = json.load(open(args.whisper_json))
    segs = data["segments"]
    if not segs:
        sys.exit("no segments in whisper json")
    language = data.get("language", "unknown")
    total_dur = segs[-1]["end"]

    paragraphs = group_paragraphs(segs, args.gap, args.max_para)

    md_path  = args.base_path + ".md"
    srt_path = args.base_path + ".srt"
    txt_path = args.base_path + ".txt"

    write_md(md_path, paragraphs, total_dur, args.source, args.model, language)
    write_srt(srt_path, segs)
    write_txt(txt_path, paragraphs)

    print(f"wrote {md_path}", file=sys.stderr)
    print(f"wrote {srt_path}", file=sys.stderr)
    print(f"wrote {txt_path}", file=sys.stderr)
    print(f"  {len(paragraphs)} paragraphs, {len(segs)} segments, "
          f"{int(total_dur//60)}:{int(total_dur%60):02d}, lang={language}",
          file=sys.stderr)

if __name__ == "__main__":
    main()
