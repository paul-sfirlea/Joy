#!/bin/bash
export PATH="/opt/homebrew/bin:$HOME/.local/bin:/usr/bin:/bin:$PATH"
python3 "/Users/Sfirlea/.claude/skills/supermemory/scripts/fetch-yahoo.py" >> "/Users/Sfirlea/.claude/skills/supermemory/data/yahoo/_cron.log" 2>&1
node "/Users/Sfirlea/.claude/skills/supermemory/scripts/build-index.mjs" >> "/Users/Sfirlea/.claude/skills/supermemory/data/yahoo/_cron.log" 2>&1
