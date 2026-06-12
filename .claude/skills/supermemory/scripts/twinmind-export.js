// TwinMind exporter — paste/run in the browser console on https://app.twinmind.com (logged in),
// or run via Chrome MCP javascript_tool. Fetches ALL call transcripts and downloads
// twinmind-export.json to ~/Downloads. Then: python3 ingest-twinmind.py ; node build-index.mjs
// Auth (Firebase ID token) is read from IndexedDB and used only inside the page — never printed.
(async () => {
  const token = await new Promise((res) => {
    const req = indexedDB.open('firebaseLocalStorageDb');
    req.onsuccess = e => { try {
      const st = e.target.result.transaction('firebaseLocalStorage', 'readonly').objectStore('firebaseLocalStorage');
      const all = st.getAll();
      all.onsuccess = () => { let t = null; for (const r of (all.result || [])) { const v = r && r.value; if (v && v.stsTokenManager && v.stsTokenManager.accessToken) t = v.stsTokenManager.accessToken; } res(t); };
      all.onerror = () => res(null);
    } catch (_) { res(null); } };
    req.onerror = () => res(null);
  });
  if (!token) return 'NO_TOKEN (are you logged in?)';
  const H = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
  const titles = async (body) => { const r = await fetch('https://api.thirdear.live/api/v1/get_memory_titles', { method: 'POST', headers: H, body: JSON.stringify(body) }); const j = await r.json(); return (j && j.memories) || []; };
  let all = [], paged = false;
  for (let off = 0; off < 5000; off += 50) { const b = await titles({ limit: 50, offset: off }); if (b.length) { paged = true; all = all.concat(b); if (b.length < 50) break; } else break; }
  if (!paged) all = await titles({});
  const seen = new Set(), ids = [];
  for (const m of all) { const id = m && m.meeting_id; if (id && !seen.has(id)) { seen.add(id); ids.push(id); } }
  const out = []; let ok = 0, fail = 0;
  for (const id of ids) {
    try {
      const r = await fetch('https://api.thirdear.live/api/v1/get_memory', { method: 'POST', headers: H, body: JSON.stringify({ meeting_id: id }) });
      const j = await r.json();
      const s = (j.memories && j.memories[0] && j.memories[0].summary) || {};
      out.push({ id, title: s.meeting_title || '', start: (s.start_time_local || s.start_time || ''), attendees: s.attendees || null, keywords: s.keywords || null, summary: s.summary || '', action: s.action || '', transcript: s.transcript || '' });
      ok++;
    } catch (e) { fail++; out.push({ id, error: String(e) }); }
  }
  const blob = new Blob([JSON.stringify(out)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'twinmind-export.json'; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 8000);
  return 'fetched ' + ok + ' ok, ' + fail + ' fail; downloaded twinmind-export.json';
})()
