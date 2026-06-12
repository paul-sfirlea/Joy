---
name: transcribe-video
description: Extract a high-accuracy transcript from any video (or audio) file. Triggers when the user wants to transcribe a video/audio file — phrases like "transcrie video-ul", "scoate transcriptul", "fă-mi transcriptul", "transcribe this video", "transcribe this MOV/MP4/M4A/WAV", "get the transcript", "extract transcript", or any time the user provides a media file path and asks for its written contents. Use whisper-large-v3-turbo (auto-detect language) and deliver three files next to the source: .md (timestamped paragraphs + metadata header), .srt (standard subtitles, one cue per segment), .txt (clean prose without timestamps).
---

# Transcribe video → .md + .srt + .txt

## Inputs

- A video or audio file path (user provides; if missing, ask).
- Output: three files written **next to the source**, sharing the source's basename plus `_transcript.{md,srt,txt}`.

## Tooling

- **ffmpeg** — for audio extraction. Install with `brew install homebrew-ffmpeg/ffmpeg/ffmpeg` if not present (the tap version has libass + all codecs; the homebrew-core build is fine for this skill too since we only need audio extraction).
- **mlx_whisper** — Apple Silicon optimized whisper. CLI binary lives at `~/Library/Python/3.9/bin/mlx_whisper`. If the user has it elsewhere, prefer `which mlx_whisper`. Falls back to `python3 -m mlx_whisper` if available.
- **Model:** default to `mlx-community/whisper-large-v3-turbo` — much more accurate than `tiny`, ~10× faster than `large-v3`. Worth the extra few minutes for a clean transcript.
- **Scripts:** `<skill-dir>/scripts/build_outputs.py` — converts whisper JSON to .md/.srt/.txt in one pass.
- **Working dir:** `/tmp/transcribe-video/<basename>/` — keep intermediate audio + whisper JSON there for debugging; final outputs go next to the source video.

## Workflow

```bash
SRC="/path/to/video.MOV"
BASE=$(basename "$SRC")
STEM="${BASE%.*}"           # e.g. "IMG_6064"
WORK="/tmp/transcribe-video/$STEM"
mkdir -p "$WORK"

# 1. Extract mono 16kHz audio (whisper's native rate)
# -nostdin is critical when running inside a `while read` loop — without it ffmpeg
# eats bytes from the loop's stdin, corrupting the next iteration's path.
ffmpeg -nostdin -y -hwaccel videotoolbox -i "$SRC" -vn -ac 1 -ar 16000 "$WORK/audio.wav" </dev/null

# 2. Transcribe with large-v3-turbo, word timestamps, auto-detect language
~/Library/Python/3.9/bin/mlx_whisper "$WORK/audio.wav" \
  --model mlx-community/whisper-large-v3-turbo \
  --word-timestamps True \
  --output-format json \
  --output-name transcript \
  --output-dir "$WORK" \
  --verbose False

# 3. Emit .md + .srt + .txt next to the source
SRC_DIR=$(dirname "$SRC")
OUT_BASE="$SRC_DIR/${STEM}_transcript"
python3 <skill-dir>/scripts/build_outputs.py \
  "$WORK/transcript.json" "$OUT_BASE" \
  --source "$SRC" \
  --model "whisper-large-v3-turbo"
```

`<skill-dir>` is the directory containing this `SKILL.md` (typically `~/.claude/skills/transcribe-video/`).

## Decisions / Defaults

- **Language:** **auto-detect** — do NOT pass `--language`. mlx_whisper detects it from the first ~30s and embeds it in the JSON's `language` field. The MD header surfaces it.
- **Paragraph break heuristic:** silence gap > 1.5s, or 45s max paragraph length. Tunable via `--gap` and `--max-para` on the script.
- **SRT cue length:** one cue per whisper segment (~5-10s typical). Good for most subtitle uses; if the user needs per-word karaoke, re-render via the `clipify` skill's `build_ass.py` instead.
- **Output naming:** `<stem>_transcript.md`, `<stem>_transcript.srt`, `<stem>_transcript.txt` — placed in the same directory as the source. The `_transcript` suffix avoids colliding with the source name and reads cleanly in Finder sorting.
- **Don't re-transcribe** if `<stem>_transcript.md` already exists and is newer than the source — ask the user if they want to overwrite. Skip the check if they passed an explicit "redo" / "re-transcribe" instruction.

## Reporting back

After the run, print to the user:
- The three output paths (linked as markdown).
- Duration, detected language, model used.
- One representative paragraph or quote from the transcript (proof of life).
- `open` the `.md` so they can verify immediately.

## Pitfalls

- **`mlx_whisper` overwrites** when given multiple input files in one call without `--output-name`. Always pass `--output-name` for a single file, or call it once per file.
- **Wrong model id:** there is no `mlx-community/whisper-tiny.en` or `whisper-large-v3-turbo.en` — the English-only variants don't exist under `mlx-community`. Use the multilingual repos and let `--language` (or auto-detect) handle it.
- **First run downloads the model** (~1.5GB for large-v3-turbo). Tell the user this is happening.
- **Non-English videos** transcribe fine on auto-detect, but if the speaker code-switches (Romanian ↔ English mid-sentence), expect occasional segments mis-tagged. The MD's `Language:` header reflects the *dominant* language, not per-segment.
- **Very long videos** (>30 min): consider running with `--clip-timestamps` to chunk, or just let it run — large-v3-turbo on M-series handles 1h in ~10 min.
- **Files with no audio stream** will fail at the ffmpeg step. Detect that with `ffprobe` first if uncertain.
- **Batch use (`while read` loops):** always pass `-nostdin` to ffmpeg AND `</dev/null` to ffmpeg, mlx_whisper, and any other command in the loop. Without that, those commands read from the loop's stdin pipe and chew through queued filenames, producing seemingly random per-iteration "file not found" failures with truncated paths in the error message.
