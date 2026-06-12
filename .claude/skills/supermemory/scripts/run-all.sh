#!/bin/bash
export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
SKILL="/Users/Sfirlea/.claude/skills/supermemory"
CONV="$SKILL/data/converted"
LOG="$CONV/_run-all.log"
echo "[$(date)] orchestrator start; waiting for phase1 (pdf+pptx)..." >> "$LOG"
waited=0
while [ ! -f "$CONV/.convert_done" ] && [ $waited -lt 7200 ]; do sleep 15; waited=$((waited+15)); done
echo "[$(date)] phase1 sentinel seen (or wait timeout). reindex..." >> "$LOG"
node "$SKILL/scripts/build-index.mjs" >> "$LOG" 2>&1
echo "[$(date)] phase2: converting ALL keynotes (DBA/BRIGADA first)..." >> "$LOG"
node "$SKILL/scripts/to-markdown.mjs" "/Users/Sfirlea/Documents/NEW LAPTOP/DBA" "/Users/Sfirlea/Documents/NEW LAPTOP/BRIGADA" "/Users/Sfirlea/Documents/NEW LAPTOP" "/Users/Sfirlea/Desktop" --only key --skip-existing >> "$LOG" 2>&1
echo "[$(date)] phase2 done. final reindex..." >> "$LOG"
node "$SKILL/scripts/build-index.mjs" >> "$LOG" 2>&1
touch "$CONV/.all_done"
echo "[$(date)] ALL DONE." >> "$LOG"
