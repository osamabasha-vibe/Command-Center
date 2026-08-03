# Put Command Center online — free, permanent, no terminal

You get a private URL that works on your laptop and phone from anywhere.
Storage is permanent (Netlify Blobs). Cost is zero on Netlify's free tier.
Takes about 5 minutes, all in a web dashboard.

---

## 1. Make a Netlify account

Go to **app.netlify.com/signup**. Email and password, or sign in with GitHub.
No card needed.

## 2. Connect the repo

**Add a new site** → **Import an existing project** → pick this repo's Git
provider and repository.

Netlify reads `netlify.toml` in this repo automatically:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

Click **Deploy**. You now have a live URL like
`command-center-yourname.netlify.app`.

## 3. Add storage

Nothing to configure here — Netlify Blobs is available to Functions on every
site automatically, no binding or namespace to create by hand. The function
in `netlify/functions/api.mjs` opens a store called `cc-data` on first use.

## 4. Set your password

Site **Configuration** → **Environment variables** → **Add a variable**.

- **Key** must be exactly: `PASSWORD`
- **Value**: whatever you want to type once per device
- Scope it to **Functions** (or all scopes) → **Save**

Then **Deploys** → **Trigger deploy** so the function picks up the new
variable.

## 5. Open it

Visit your site URL. It asks for the password once, then remembers that
device.

Done. Every change saves to Netlify Blobs automatically. Open the same URL on
your phone, enter the password once, same board.

---

## Moving your existing data over

On your current board: **⟲** → **⤓ Download backup**.
On the online version: **⟲** → **⤒ Load backup file** → pick that file.

## Backups

Every save keeps a copy of the previous state for 60 days.

- List them: `your-url/api/backups?p=YOURPASSWORD`
- View one:  `your-url/api/backup?name=backup:2026-08-03T...&p=YOURPASSWORD`

Copy the contents of a backup, then in the app use **⟲** → **Paste data**.

Also download a backup file every so often. It costs you five seconds.

## Updating to a new version

Push to the connected branch. Netlify rebuilds and redeploys automatically.
Your data lives in Blobs and is untouched by this.

## Limits on the free tier

125,000 function requests a month. You will use a few hundred. Not a concern.

## A note on the password

This keeps casual visitors out. It is not bank-grade security, and anyone with
your URL and password has full access. Do not put anything in here you would
be harmed by leaking. For stronger protection, a dashboard-level access
restriction can put a real login in front of the whole site.
