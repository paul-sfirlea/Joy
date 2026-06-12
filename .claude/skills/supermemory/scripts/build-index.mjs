#!/usr/bin/env node
// Free Supermemory — local index builder. Zero external dependencies.
// Walks the roots in ../config.json and writes:
//   data/manifest.json  — full structured catalog (everything, grep-able)
//   data/INDEX.md       — rich routing map for TEXT notes (md/txt)
//   data/FILES.md       — folder summary for binary files (PDF/Keynote/Office)
import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(HERE, '..');
const DATA_DIR = join(ROOT_DIR, 'data');
const cfg = JSON.parse(await readFile(join(ROOT_DIR, 'config.json'), 'utf8'));

const FULL = new Set((cfg.extensions.full || []).map(s => s.toLowerCase()));
const LIST = new Set((cfg.extensions.listOnly || []).map(s => s.toLowerCase()));
const BUNDLE = new Set(['.key', '.pages', '.numbers', '.app']); // macOS packages = treat as one file
const EXCLUDE = new Set(cfg.excludeDirs || []);
const MAX_READ = 1024 * 1024; // 1 MB cap for text reads

async function walk(dir, root, out) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const ext = extname(e.name).toLowerCase();
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      if (BUNDLE.has(ext)) { out.push(await listOnly(full, root, ext)); continue; } // package, don't descend
      if (e.name.startsWith('.') || EXCLUDE.has(e.name)) continue;
      await walk(full, root, out);
      continue;
    }
    if (FULL.has(ext)) out.push(await parseText(full, root, ext));
    else if (LIST.has(ext) || BUNDLE.has(ext)) out.push(await listOnly(full, root, ext));
  }
}

function parseFrontmatter(text) {
  if (!text.startsWith('---')) return { fm: {}, body: text };
  const end = text.indexOf('\n---', 3);
  if (end === -1) return { fm: {}, body: text };
  const raw = text.slice(3, end).trim();
  const body = text.slice(end + 4);
  const fm = {};
  let key = null;
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (m) {
      key = m[1];
      let v = m[2].trim();
      if (v.startsWith('[') && v.endsWith(']')) {
        v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else { v = v.replace(/^["']|["']$/g, ''); }
      fm[key] = v;
    } else if (/^\s*-\s+/.test(line) && key) {
      if (!Array.isArray(fm[key])) fm[key] = fm[key] ? [fm[key]] : [];
      fm[key].push(line.replace(/^\s*-\s+/, '').trim().replace(/^["']|["']$/g, ''));
    }
  }
  return { fm, body };
}

function firstSummary(body) {
  for (let line of body.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('#') || line.startsWith('![')) continue;
    if (/^\*\(.*\)\*$/.test(line)) continue;
    return line.replace(/^[*_>\-\s]+/, '').slice(0, 240);
  }
  return '';
}

async function parseText(full, root, ext) {
  const st = await stat(full).catch(() => null);
  if (!st) return listOnly(full, root, ext);
  let text = '';
  if (st.size <= MAX_READ) text = await readFile(full, 'utf8').catch(() => '');
  const isMd = ext === '.md' || ext === '.markdown';
  const { fm, body } = isMd ? parseFrontmatter(text) : { fm: {}, body: text };
  const h1 = (body.match(/^#\s+(.+)$/m) || [])[1];
  const headings = isMd ? [...body.matchAll(/^#{1,3}\s+(.+)$/gm)].map(m => m[1].trim()).slice(0, 12) : [];
  const tags = [].concat(fm.tags || [])
    .concat(isMd ? [...text.matchAll(/(?:^|\s)#([A-Za-z0-9_\/-]{2,})/g)].map(m => m[1]) : []);
  const links = isMd ? [...text.matchAll(/\[\[([^\]|#]+)/g)].map(m => m[1].trim()) : [];
  const rel = relative(root.path, full);
  return {
    kind: 'note',
    title: (h1 || fm.title || basename(full).replace(/\.[^.]+$/, '')).toString().trim(),
    rel, root: root.label, para: rel.split('/')[0],
    summary: firstSummary(body),
    tags: [...new Set(tags)].slice(0, 20),
    links: [...new Set(links)].slice(0, 30),
    type: fm.type || '', role: fm.role || '', scope: fm.scope || '',
    frontmatter: fm, headings, ext: ext.slice(1),
    size: st.size, mtime: st.mtime.toISOString().slice(0, 10), path: full,
  };
}

async function listOnly(full, root, ext) {
  let size = 0, mtime = '';
  try { const st = await stat(full); size = st.size; mtime = st.mtime.toISOString().slice(0, 10); } catch {}
  const rel = relative(root.path, full);
  return { kind: 'file', fileType: ext.slice(1), title: basename(full), rel, root: root.label, para: rel.split('/')[0], size, mtime, path: full };
}

const all = [];
const activeRoots = (cfg.roots || []).filter(r => r.enabled && existsSync(r.path));
for (const r of activeRoots) await walk(r.path, r, all);
all.sort((a, b) => (a.root + a.rel).localeCompare(b.root + b.rel));
const notes = all.filter(n => n.kind === 'note');
const files = all.filter(n => n.kind === 'file');

if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
const generatedAt = new Date().toISOString();
const stamp = generatedAt.slice(0, 16).replace('T', ' ');

await writeFile(join(DATA_DIR, 'manifest.json'), JSON.stringify(
  { generatedAt, version: 2, roots: activeRoots.map(r => r.label), counts: { notes: notes.length, files: files.length }, entries: all }, null, 2));

// INDEX.md — rich routing map for text notes
let idx = `# Free Supermemory — Notes Index\n\n_Generated ${stamp} · ${notes.length} text notes · roots: ${activeRoots.map(r => r.label).join(', ')}_\n\n> Routing map. Locate a note by title/summary/tag, then Read/Grep its \`path\`. For decks/PDFs/Keynote see FILES.md + manifest.json.\n`;
const byRootN = {};
for (const n of notes) { (byRootN[n.root] ??= {}); (byRootN[n.root][n.para] ??= []).push(n); }
for (const [r, paras] of Object.entries(byRootN)) {
  idx += `\n## ${r}\n`;
  for (const [para, items] of Object.entries(paras).sort()) {
    idx += `\n### ${para} (${items.length})\n`;
    for (const n of items) {
      const tg = n.tags.length ? `  \`#${n.tags.slice(0, 6).join(' #')}\`` : '';
      const sum = n.summary ? ` — ${n.summary}` : '';
      idx += `- **${n.title}** · \`${n.rel}\`${sum}${tg}\n`;
    }
  }
}
await writeFile(join(DATA_DIR, 'INDEX.md'), idx);

// FILES.md — folder summary for binary files
let ff = `# Free Supermemory — Files Index\n\n_Generated ${stamp} · ${files.length} files (decks, PDFs, Keynote, Office docs)_\n\n> Folder map. Find a folder below, then grep manifest.json for the exact name. Extract content on demand (PDF→text, Keynote→PDF→text).\n`;
const byRootF = {};
for (const f of files) { const folder = dirname(f.rel) || '.'; (byRootF[f.root] ??= {}); (byRootF[f.root][folder] ??= []).push(f); }
for (const [r, folders] of Object.entries(byRootF)) {
  ff += `\n## ${r}\n`;
  const rows = Object.entries(folders).map(([folder, items]) => {
    const types = {}; for (const it of items) types[it.fileType] = (types[it.fileType] || 0) + 1;
    const mix = Object.entries(types).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${c} ${t}`).join(', ');
    return { folder, n: items.length, mix };
  }).sort((a, b) => b.n - a.n);
  for (const row of rows.slice(0, 150)) ff += `- \`${row.folder}\` — ${row.n} (${row.mix})\n`;
  if (rows.length > 150) ff += `- … +${rows.length - 150} more folders (see manifest.json)\n`;
}
await writeFile(join(DATA_DIR, 'FILES.md'), ff);

console.log(`Notes: ${notes.length} · Files: ${files.length}`);
for (const r of activeRoots) console.log(`  ${r.label}: ${all.filter(x => x.root === r.label).length}`);
console.log(`-> ${join(DATA_DIR, 'INDEX.md')} / FILES.md / manifest.json`);
