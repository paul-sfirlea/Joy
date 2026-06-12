#!/bin/bash
# Grind Yahoo to completion despite throttling: re-run the resumable fetcher
# until done_uids stops growing (3 stalls). Each run gets ~150 before Yahoo throttles.
export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
export YAHOO_TIMEOUT=30
SK="/Users/Sfirlea/.claude/skills/supermemory"
YDIR="$SK/data/yahoo"
LOG="$YDIR/_loop.log"
rm -f "$YDIR/.yahoo_done"
stall=0
for run in $(seq 1 300); do
  before=$(wc -l < "$YDIR/.done_uids" 2>/dev/null | tr -d ' '); before=${before:-0}
  python3 "$SK/scripts/fetch-yahoo.py" >> "$LOG" 2>&1
  after=$(wc -l < "$YDIR/.done_uids" 2>/dev/null | tr -d ' '); after=${after:-0}
  saved=$(ls "$YDIR"/*.md 2>/dev/null | wc -l | tr -d ' ')
  echo "[loop $run] $(date '+%H:%M') done_uids $before->$after | saved=$saved" >> "$LOG"
  if [ "$after" -le "$before" ]; then stall=$((stall+1)); else stall=0; fi
  [ "$stall" -ge 3 ] && { echo "[loop] no progress 3x -> stop" >> "$LOG"; break; }
  # periodic reindex so new mail is searchable as we go
  [ $((run % 10)) -eq 0 ] && node "$SK/scripts/build-index.mjs" >> "$LOG" 2>&1
  sleep 25
done
node "$SK/scripts/build-index.mjs" >> "$LOG" 2>&1
touch "$YDIR/.yahoo_done"
echo "[loop] ALL DONE $(date) | saved=$(ls "$YDIR"/*.md 2>/dev/null | wc -l | tr -d ' ')" >> "$LOG"
