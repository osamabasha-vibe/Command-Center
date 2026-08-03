// Command Center — Netlify Function
// Backs /api/data, /api/backups, /api/backup with Netlify Blobs. Free tier,
// permanent storage. See DEPLOY.md for the dashboard setup.

import { getStore } from '@netlify/blobs';

const KEY = 'board';
const BACKUP_PREFIX = 'backup:';
const BACKUP_MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
const STAMP_RE = /^(\d{4}-\d{2}-\d{2})T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/;

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

function stampToDate(stamp) {
  const m = STAMP_RE.exec(stamp);
  if (!m) return null;
  return new Date(`${m[1]}T${m[2]}:${m[3]}:${m[4]}.${m[5]}Z`);
}

async function pruneOldBackups(store) {
  const { blobs } = await store.list({ prefix: BACKUP_PREFIX });
  const cutoff = Date.now() - BACKUP_MAX_AGE_MS;
  await Promise.all(
    blobs
      .filter((b) => {
        const d = stampToDate(b.key.slice(BACKUP_PREFIX.length));
        return d && d.getTime() < cutoff;
      })
      .map((b) => store.delete(b.key))
  );
}

export default async (req) => {
  const url = new URL(req.url);
  const pass = process.env.PASSWORD || '';
  const given = req.headers.get('X-CC-Pass') || url.searchParams.get('p') || '';
  if (pass && given !== pass) return json({ error: 'unauthorized' }, 401);

  const store = getStore('cc-data');

  if (url.pathname === '/api/data') {
    if (req.method === 'GET') {
      const raw = await store.get(KEY);
      return json(raw ? JSON.parse(raw) : {});
    }

    if (req.method === 'POST') {
      let body;
      try {
        body = await req.json();
      } catch {
        return json({ error: 'bad json' }, 400);
      }
      if (!body || typeof body !== 'object') return json({ error: 'bad body' }, 400);

      // keep the previous state before overwriting
      const prev = await store.get(KEY);
      if (prev) {
        const stamp = new Date().toISOString().replace(/[:.]/g, '-');
        await store.set(BACKUP_PREFIX + stamp, prev);
        await pruneOldBackups(store);
      }

      await store.set(KEY, JSON.stringify(body));
      return json({ ok: true, saved: new Date().toISOString() });
    }

    return json({ error: 'method not allowed' }, 405);
  }

  if (url.pathname === '/api/backups') {
    const { blobs } = await store.list({ prefix: BACKUP_PREFIX });
    return json({ backups: blobs.map((b) => b.key).sort().reverse().slice(0, 50) });
  }

  if (url.pathname === '/api/backup') {
    const name = url.searchParams.get('name');
    if (!name) return json({ error: 'name required' }, 400);
    const raw = await store.get(name);
    return raw ? json(JSON.parse(raw)) : json({ error: 'not found' }, 404);
  }

  return json({ error: 'not found' }, 404);
};

export const config = { path: ['/api/data', '/api/backups', '/api/backup'] };
