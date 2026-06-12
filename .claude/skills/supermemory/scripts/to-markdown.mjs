#!/usr/bin/env node
// Free Supermemory — convert files to Markdown via MarkItDown (+ Apple iWork via osascript).
// Native (MarkItDown): pdf, pptx, docx, xlsx, csv, html, json, xml, epub, images, audio, ...
// iWork bundles (.key/.pages/.numbers): auto-exported to PDF first (needs Keynote/Pages/Numbers + Automation permission).
//
// Usage:
//   node to-markdown.mjs <file|dir> [more...] [--out DIR] [--only pdf,pptx] [--skip-existing]
// Output: data/converted/<parent>__<name>.md   (then run build-index.mjs)
import { readdir, stat, mkdir, writeFile, appendFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, dirname, extname, basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DEFAULT = join(HERE, '..', 'data', 'converted');
const MD_BIN = join(process.env.HOME, '.local', 'bin', 'markitdown');
const MD = existsSync(MD_BIN) ? MD_BIN : 'markitdown';

const NATIVE = new Set(['.pdf', '.pptx', '.docx', '.xlsx', '.xls', '.csv', '.html', '.htm', '.json', '.xml', '.epub', '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.mp3', '.wav', '.m4a', '.ppt', '.doc', '.rtf']);
const IWORK = { '.key': 'Keynote', '.pages': 'Pages', '.numbers': 'Numbers' };
const SKIPDIRS = new Set(['.git', 'node_modules', '.obsidian', '.claude', 'Library', '.Trash', '_attachments', '.cache', 'Vaults']);

const argv = process.argv.slice(2);
function takeOpt(flag) { const i = argv.indexOf(flag); if (i === -1) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; }
function takeFlag(flag) { const i = argv.indexOf(flag); if (i === -1) return false; argv.splice(i, 1); return true; }
let outDir = resolve(takeOpt('--out') || OUT_DEFAULT);
const onlyRaw = takeOpt('--only');
const ONLY = onlyRaw ? new Set(onlyRaw.split(',').map(s => '.' + s.trim().replace(/^\./, '').toLowerCase())) : null;
const skipExisting = takeFlag('--skip-existing');
const LIMIT = Number(takeOpt('--limit') || 0);
const inputs = argv.filter(a => !a.startsWith('--'));
if (!inputs.length) { console.error('Usage: node to-markdown.mjs <file|dir> [--out DIR] [--only pdf,pptx] [--skip-existing]'); process.exit(1); }
await mkdir(outDir, { recursive: true });
const LOG = join(outDir, '_convert.log');

function wanted(ext) { return (NATIVE.has(ext) || IWORK[ext]) && (!ONLY || ONLY.has(ext)); }

async function collect(p, acc) {
  const st = await stat(p).catch(() => null); if (!st) return;
  const ext = extname(p).toLowerCase();
  if (st.isDirectory()) {
    if (IWORK[ext]) { if (wanted(ext)) acc.push(p); return; }  // iWork package = one file
    if (SKIPDIRS.has(basename(p)) || basename(p).startsWith('.')) return;
    for (const e of await readdir(p)) await collect(join(p, e), acc);
    return;
  }
  if (wanted(ext)) acc.push(p);
}

function outName(src) {
  const parent = basename(dirname(src)).replace(/[\/\\:?*"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 30);
  const base = basename(src).replace(/\.[^.]+$/, '').replace(/[\/\\:?*"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return `${parent}__${base}`.replace(/^_+/, '') || 'file';
}

async function iworkToPdf(src, app) {
  const tmp = join('/tmp', `sm_${Date.now()}_${Math.floor(Math.random() * 1e6)}.pdf`); // plain node script: Date/random OK
  const KT = Number(process.env.SM_KEY_TIMEOUT || 900);
  const script = `with timeout of ${KT} seconds
tell application "${app}"
  set d to open POSIX file ${JSON.stringify(src)}
  export d to POSIX file ${JSON.stringify(tmp)} as PDF
  close d saving no
end tell
end timeout`;
  await run('osascript', ['-e', script], { timeout: (KT + 30) * 1000 });
  return tmp;
}

const files = [];
for (const inp of inputs) await collect(resolve(inp), files);
const header = `[${new Date().toISOString()}] Found ${files.length} file(s)${ONLY ? ' (only ' + [...ONLY].join(',') + ')' : ''} -> ${outDir}`;
console.log(header); await appendFile(LOG, header + '\n').catch(() => {});

let ok = 0, fail = 0, skip = 0, processed = 0; const seen = new Set();
for (const src of files) {
  const ext = extname(src).toLowerCase();
  const nm = outName(src);
  let file = `${nm}.md`, i = 2; while (seen.has(file)) file = `${nm}-${i++}.md`; seen.add(file);
  const dest = join(outDir, file);
  if (skipExisting && existsSync(dest)) { skip++; continue; }
  if (LIMIT && processed >= LIMIT) break;
  processed++;
  try {
    let target = src, tmpPdf = null;
    if (IWORK[ext]) { tmpPdf = await iworkToPdf(src, IWORK[ext]); target = tmpPdf; }
    const { stdout } = await run(MD, [target], { maxBuffer: 256 * 1024 * 1024, timeout: 300000 });
    if (tmpPdf) await rm(tmpPdf, { force: true });
    const body = (stdout || '').trim();
    if (!body) { fail++; await appendFile(LOG, `  ∅ empty: ${src}\n`).catch(() => {}); continue; }
    await writeFile(dest, `---\nsource_path: ${JSON.stringify(src)}\nconverted: markitdown\n---\n\n${body}\n`);
    ok++;
    const line = `  ✓ ${file} (${body.length} chars)`;
    console.log(line); await appendFile(LOG, line + '\n').catch(() => {});
  } catch (e) {
    fail++;
    const line = `  ✗ ${basename(src)} — ${String(e.message || e).split('\n')[0].slice(0, 140)}`;
    console.log(line); await appendFile(LOG, line + '\n').catch(() => {});
  }
}
const done = `[${new Date().toISOString()}] Done. ${ok} converted, ${skip} skipped(existing), ${fail} failed/empty.`;
console.log(done); await appendFile(LOG, done + '\n').catch(() => {});
console.log(`Next: node "${join(HERE, 'build-index.mjs')}"`);
