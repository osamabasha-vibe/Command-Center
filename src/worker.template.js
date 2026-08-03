// Command Center — Cloudflare Worker
// Serves the app and stores the board in KV. Free tier, permanent storage.
//
// Setup (all in the Cloudflare dashboard, no terminal):
//   1. Workers & Pages -> Create -> Worker -> Deploy -> Edit code
//   2. Paste this whole file, click Deploy
//   3. Settings -> Variables -> KV Namespace Bindings -> Add
//        Variable name:  CC        Namespace: create one called cc-data
//   4. Settings -> Variables -> Environment Variables -> Add
//        Name: PASSWORD   Value: whatever you want   (click Encrypt)
//   5. Deploy again. Open your worker URL.

const HTML = `/*{{HTML}}*/`;

const KEY = 'board';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pass = env.PASSWORD || '';

    if (url.pathname === '/api/data') {
      const given = request.headers.get('X-CC-Pass') || '';
      if (pass && given !== pass) {
        return json({ error: 'unauthorized' }, 401);
      }

      if (request.method === 'GET') {
        const raw = await env.CC.get(KEY);
        return json(raw ? JSON.parse(raw) : {});
      }

      if (request.method === 'POST') {
        let body;
        try {
          body = await request.json();
        } catch (e) {
          return json({ error: 'bad json' }, 400);
        }
        if (!body || typeof body !== 'object') return json({ error: 'bad body' }, 400);

        // keep the previous state before overwriting
        const prev = await env.CC.get(KEY);
        if (prev) {
          const stamp = new Date().toISOString().replace(/[:.]/g, '-');
          await env.CC.put('backup:' + stamp, prev, { expirationTtl: 60 * 60 * 24 * 60 });
        }

        await env.CC.put(KEY, JSON.stringify(body));
        return json({ ok: true, saved: new Date().toISOString() });
      }

      return json({ error: 'method not allowed' }, 405);
    }

    // list recent backups:  /api/backups
    if (url.pathname === '/api/backups') {
      const given = request.headers.get('X-CC-Pass') || url.searchParams.get('p') || '';
      if (pass && given !== pass) return json({ error: 'unauthorized' }, 401);
      const list = await env.CC.list({ prefix: 'backup:' });
      return json({ backups: list.keys.map(k => k.name).sort().reverse().slice(0, 50) });
    }

    // fetch one backup:  /api/backup?name=backup:...&p=password
    if (url.pathname === '/api/backup') {
      const given = request.headers.get('X-CC-Pass') || url.searchParams.get('p') || '';
      if (pass && given !== pass) return json({ error: 'unauthorized' }, 401);
      const name = url.searchParams.get('name');
      if (!name) return json({ error: 'name required' }, 400);
      const raw = await env.CC.get(name);
      return raw ? json(JSON.parse(raw)) : json({ error: 'not found' }, 404);
    }

    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      }
    });
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}
