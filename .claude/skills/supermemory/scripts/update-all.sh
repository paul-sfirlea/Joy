#!/bin/bash
# Free Supermemory - keep everything current. Run by launchd on a schedule.
# Refreshes local sources + continues Yahoo (resumable) + reindexes.
export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
SK="/Users/Sfirlea/.claude/skills/supermemory"
LOG="$SK/data/_update.log"
echo "[update $(date '+%Y-%m-%d %H:%M')] start" >> "$LOG"

# 1) Wispr Flow — new dictations since last run
python3 "$SK/scripts/fetch-wispr.py" >> "$LOG" 2>&1

# 2) Yahoo — one resumable pass (skips done UIDs; gets more each run)
python3 "$SK/scripts/fetch-yahoo.py" >> "$LOG" 2>&1

# 3) Reindex everything — auto-picks up new/edited Second Brain notes + new laptop text files
node "$SK/scripts/build-index.mjs" >> "$LOG" 2>&1

echo "[update $(date '+%Y-%m-%d %H:%M')] done | yahoo=$(ls "$SK/data/yahoo"/*.md 2>/dev/null | wc -l | tr -d ' ')" >> "$LOG"
