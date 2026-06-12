#!/usr/bin/env node
// Free Supermemory — Apple Notes snapshot (optional, on demand).
// Dumps all Apple Notes to local markdown via AppleScript, so they're indexed offline.
// SKIPS notes whose title looks like a secret (credentials/keys/passwords/IBAN/PIN).
// First run may trigger a macOS Automation permission prompt for the terminal — approve it once.
//
// Usage: node export-apple-notes.mjs
// Output: data/apple-notes/*.md   (then run build-index.mjs)
import { writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'data', 'apple-notes');
const run = promisify(execFile);

// Titles matching these are NOT written to disk (kept private).
const SECRET = /(credential|password|parol|\bpin\b|\bkey\b|1pass|whoop|api|token|login|iban|\bcvv\b|seed|secret|cont\b)/i;

const SCRIPT = `
tell application "Notes"
  set output to ""
  repeat with n in notes
    try
      set output to output & "@@T@@" & (name of n) & "@@B@@" & (body of n) & "@@E@@"
    end try
  end repeat
  return output
end tell`;

function htmlToText(html) {
  return (html || '')
    .replace(/<\/(div|p|li|h[1-6]|ul|ol|br)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '- ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n').trim();
}
function slug(s) { return (s || 'note').replace(/[\/\\:?*"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 70) || 'note'; }

let raw;
try { raw = (await run('osascript', ['-e', SCRIPT], { maxBuffer: 256 * 1024 * 1024 })).stdout; }
catch (e) {
  console.error('AppleScript failed. If this is a permission error, enable Automation control of "Notes" for your terminal in System Settings > Privacy & Security > Automation, then retry.');
  console.error(e.message); process.exit(1);
}

await mkdir(OUT, { recursive: true });
const chunks = raw.split('@@E@@');
let written = 0, skipped = 0; const seen = new Set();
for (const ch of chunks) {
  const m = ch.match(/@@T@@([\s\S]*?)@@B@@([\s\S]*)/);
  if (!m) continue;
  const title = m[1].trim();
  if (!title) continue;
  if (SECRET.test(title)) { skipped++; continue; }
  const text = htmlToText(m[2]);
  if (!text) { skipped++; continue; }
  let name = slug(title), file = `${name}.md`, i = 2;
  while (seen.has(file)) file = `${name}-${i++}.md`;
  seen.add(file);
  await writeFile(join(OUT, file), `---\nsource: apple-notes\ntitle: ${JSON.stringify(title)}\n---\n\n# ${title}\n\n${text}\n`);
  written++;
}
console.log(`Exported ${written} Apple Notes -> ${OUT} (${skipped} skipped: secrets/empty)`);
console.log('Now run: node "' + join(HERE, 'build-index.mjs') + '"');
