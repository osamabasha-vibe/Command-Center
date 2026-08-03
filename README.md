# Command Center

Project and task board for running several companies at once. Every project
carries goals, every goal carries an ordered chain of actions, every action can
belong to a person. Three views: the board, the next action on everything, and
a per-person task list.

No build tooling, no accounts, no frontend dependencies. Node to build, Python
to serve locally, both stdlib only. The only dependency is `@netlify/blobs`,
used solely by the Netlify Function that backs the online deploy.

## Quick start

```bash
npm run build     # src/ -> dist/
npm start         # builds, then serves on http://localhost:8787
npm test          # headless functional tests
```

Or skip the server entirely: open `dist/index.html` directly in Chrome, click
🖫, and pick a `.json` file to save into.

## Deploy online

Connect this repo to Netlify — it builds and serves itself via
`netlify.toml`, with `netlify/functions/api.mjs` backing the API on Netlify
Blobs. Full walkthrough in [DEPLOY.md](DEPLOY.md). Free tier, permanent
storage, works from your phone.

## Layout

```
src/                 the actual source — edit here
  css/               concatenated in filename order
  js/                concatenated in filename order, one shared scope
  shell.html         page skeleton
build.js             src/ -> dist/
dist/                generated, do not edit
server/              local Python server, keeps data.json + timestamped backups
netlify/functions/   Netlify Function backing /api/data on Netlify Blobs
test/                headless tests, no framework
```

## Working on it

Read [CLAUDE.md](CLAUDE.md) first. It covers the data model, why the JS shares
one global scope, the drag performance rules, and the hard constraints around
never breaking saved data.

Short version:

- Edit `src/`, run `npm run build`, refresh.
- Call `save()` after any mutation.
- Run user text through `esc()` before it enters a template string.
- Never change the storage keys, and migrate rather than reseed.
- `npm test` before you ship.

## Backing up

The ⟲ button in the app downloads a full JSON backup and loads one back. Do it
before any significant change. The local server also snapshots `data.json`
before every single write into `server/backups/`.
