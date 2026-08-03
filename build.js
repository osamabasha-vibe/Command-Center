#!/usr/bin/env node
/**
 * Build: src/ -> dist/
 *
 *   dist/index.html   single self-contained file. Works standalone (file or
 *                      local server) and, unchanged, against the Netlify
 *                      Function backend in netlify/functions/api.mjs — the
 *                      password-header logic below is a no-op until a
 *                      password-gated /api/data starts returning 401.
 *
 * All CSS and JS files are concatenated in filename order, so the numeric
 * prefixes control load order. Everything shares one global scope on purpose:
 * inline onclick handlers in template strings call these functions by name.
 *
 *   node build.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

function readDir(dir, ext) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => ({
      name: f,
      body: fs.readFileSync(path.join(dir, f), 'utf8').trim()
    }));
}

function banner(name) {
  return `\n/* ===== ${name} ===== */\n`;
}

function build() {
  const cssFiles = readDir(path.join(SRC, 'css'), '.css');
  const jsFiles = readDir(path.join(SRC, 'js'), '.js');

  if (!cssFiles.length) throw new Error('no css files found in src/css');
  if (!jsFiles.length) throw new Error('no js files found in src/js');

  const css = cssFiles.map((f) => banner(f.name) + f.body).join('\n');
  const js = jsFiles.map((f) => banner(f.name) + f.body).join('\n');

  const shell = fs.readFileSync(path.join(SRC, 'shell.html'), 'utf8');
  if (!shell.includes('/* {{CSS}} */') || !shell.includes('/* {{JS}} */')) {
    throw new Error('shell.html is missing a {{CSS}} or {{JS}} placeholder');
  }

  const shellHtml = shell
    .replace('/* {{CSS}} */', css)
    .replace('/* {{JS}} */', js);

  // always include the password-header logic: harmless against a server
  // that never 401s (local server, file mode), required against the
  // password-gated Netlify Function.
  const html = addCloudAuth(shellHtml);

  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, 'index.html'), html);

  const kb = (n) => (n / 1024).toFixed(1) + ' KB';
  console.log(`  ${cssFiles.length} css + ${jsFiles.length} js files`);
  console.log(`  dist/index.html  ${kb(html.length)}`);
}

function addCloudAuth(html) {
  const anchor =
    "const SERVER=location.protocol==='http:'||location.protocol==='https:';";
  if (!html.includes(anchor)) throw new Error('cloud patch anchor not found');

  const helpers =
    anchor +
    `
function ccPass(){return localStorage.getItem('cc_pass')||'';}
function ccHeaders(){return{'Content-Type':'application/json','X-CC-Pass':ccPass()};}
function askPass(msg){const p=prompt(msg||'Enter your Command Center password');if(p===null)return false;localStorage.setItem('cc_pass',p);return true;}`;

  let out = html.replace(anchor, helpers);

  const postFrom =
    "fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(store)})\n      .then(r=>{if(!r.ok)throw 0;";
  const postTo =
    "fetch('/api/data',{method:'POST',headers:ccHeaders(),body:JSON.stringify(store)})\n      .then(r=>{if(r.status===401){if(askPass('Wrong or missing password. Try again:'))pushServer();throw 0;}if(!r.ok)throw 0;";
  if (!out.includes(postFrom)) throw new Error('cloud patch: POST anchor not found');
  out = out.replace(postFrom, postTo);

  const getFrom =
    "    const r=await fetch('/api/data',{cache:'no-store'});\n    if(!r.ok)throw 0;";
  const getTo =
    "    let r=await fetch('/api/data',{cache:'no-store',headers:ccHeaders()});\n    if(r.status===401){if(!askPass('Enter your Command Center password'))return;r=await fetch('/api/data',{cache:'no-store',headers:ccHeaders()});}\n    if(!r.ok)throw 0;";
  if (!out.includes(getFrom)) throw new Error('cloud patch: GET anchor not found');
  out = out.replace(getFrom, getTo);

  return out;
}

try {
  build();
} catch (err) {
  console.error('build failed:', err.message);
  process.exit(1);
}
