# Command Center

A single-user project and task board for Osama, who runs several companies at
once (INSHARO, Pharaoh Retail, Super Studios, exefai, Tayseer) plus a set of
personal projects. It exists to answer one question fast: what is the next
action on everything, and who owns it.

## Run it

```bash
npm run build      # src/ -> dist/
npm test           # headless functional tests against dist/index.html
npm start          # local server on http://localhost:8787
```

There are no dependencies. No install step. Node for build and tests, Python 3
for the server, both stdlib only. Do not add a bundler, a framework, or a
package manager dependency without being asked — the zero-dependency property
is deliberate and load-bearing.

## Architecture

`src/` is the source of truth. `dist/` is generated — never edit it by hand.

```
src/
  shell.html              page skeleton with {{CSS}} and {{JS}} placeholders
  css/*.css               concatenated in filename order
  js/*.js                 concatenated in filename order
  worker.template.js      Cloudflare Worker, app injected at /*{{HTML}}*/
build.js                  assembles everything
dist/index.html           deployable single file
dist/worker.js            deployable Cloudflare Worker
server/server.py          local server, stores data.json on disk
test/features.test.js     headless tests with a hand-rolled DOM stub
```

**All JS files share one global scope.** They are concatenated, not imported.
This is intentional: the UI is rendered as template strings with inline
`onclick="doThing('id')"` handlers, which resolve against globals. Do not
convert to ES modules unless you also rewrite every handler to use event
delegation — that is a large change, so ask first.

The numeric filename prefixes control concatenation order and therefore
definition order. Keep them.

| Prefix | Contains |
|---|---|
| `00-03` | constants and first-run seed data |
| `10-11` | store bootstrap, migrations, persistence |
| `20` | theme, work/personal switching, view routing |
| `30-32` | left sidebar: companies, projects, people |
| `40` | all drag and drop |
| `50-51` | inline editing, idea backlog |
| `60-63` | the four views: board, focus, people, popup |
| `70-71` | restore/backup, File System Access API |

## Data model

One `store` object, persisted whole:

```js
store = {
  work:     { cos: [Company], projects: [Project] },
  personal: { cos: [Company], projects: [Project] },
  people:   [Person],          // shared across both spaces
  order:    { [personId]: [stepId] },   // per-person task priority order
  colOrder: { work|personal: [personId] } // people column arrangement
}

Project = { id, name, co, st, team: [personId], ideas: [string], goals: [Goal] }
Goal    = { id, title, steps: [Step] }
Step    = { id, t, w, a, p, d }
```

- `co` is a company id or `null` (a "floating" project).
- `st` is `active` | `paused` | `killed`.
- Step `t` is the text, `w` is the owner label shown on cards, `a` is an
  explicit assignee person id, `p` is priority `h`|`m`|`l`, `d` is 0 or 1 done.
- `w` and `a` both exist for a reason: seed data and quick typing only set `w`
  (free text like "BDA team"), while dragging a task to a person sets both.
  `personMatches()` in `62-people-view.js` handles the fallback.

**Step ids must be stable.** Per-person priority ordering is stored as arrays of
step ids. Anything that creates a step must call `sid()`. Anything that deletes
one must also purge it from `store.order`.

## Persistence

Three modes, chosen automatically:

1. **Cloud** — served over http(s) with a password. POSTs to `/api/data` with
   an `X-CC-Pass` header. Cloudflare Worker + KV.
2. **Local server** — same `/api/data` endpoints, no password, `data.json` on
   disk with a timestamped snapshot before every write.
3. **File** — opened as a local file. localStorage plus, in Chrome and Edge, a
   real file on disk through the File System Access API.

`save()` writes to localStorage every time and then routes to whichever backend
is live. Call `save()` after any mutation — nothing else persists.

### Never break the user's data

This has already gone wrong once. In earlier versions each rebuild used a new
localStorage key and silently orphaned everything the user had entered. Rules
that follow from that:

- Do not change the localStorage key (`cc9`) or the KV key (`board`).
- Any change to the data shape needs a migration in `10-state.js` that runs
  against old data, not a fresh seed.
- Seed data is for a genuinely empty store only. Never overwrite a populated one.
- Keep the snapshot-before-write behaviour in the server and worker.

## Rendering

There is no virtual DOM. Each view has a render function that rebuilds its
container's `innerHTML`:

`rB()` board · `rF()` focus · `rPeople()` people · `rPop()` popup ·
`rCos()` `rPJ()` `rSB()` sidebar sections · `rAll()` everything.

`rAll()` is convenient but rebuilds the whole page. In drag paths and anything
that fires repeatedly, call the narrowest render that covers the change.

Always run user text through `esc()` before putting it in a template string.

## Drag and drop

`drag` is a single module-level object describing what is in flight:
`{type:'proj'|'person'|'co'|'act'|'task'|'col', ...}`. Every drop handler must
check `drag.type` before acting, and must clear `drag` when done. `dEnd()`
resets everything.

Performance rules, learned from a version that was visibly laggy:

- Never call `getBoundingClientRect()` inside `dragover` — it fires ~60×/sec and
  forces layout. Measure once in `dragenter` and cache it.
- Only touch classes when the state actually changed, not on every event.
- `body.dragging` suppresses transitions; keep it applied for the whole drag.

## Testing

`npm test` runs `test/features.test.js` against the built `dist/index.html`. It
stubs a minimal DOM, evaluates the app's JS, and exercises real behaviour:
priorities, add and delete, reassignment, ordering, sorting, column reordering,
and that every view renders.

Build before testing — the tests read `dist/`, not `src/`. Add a case to this
file for any behaviour change; it is the only safety net here.

## Style

Dark by default, light theme via a `body.light` class overriding CSS variables.
Never hardcode a colour in a component rule — use the variables in
`00-tokens.css` or both themes break.

The interface is deliberately low-friction: inline `contenteditable` instead of
forms, Enter to save, drag instead of dialogs, and one grouped dropdown for
company and status rather than several controls. When adding a feature, prefer
direct manipulation over a modal.
