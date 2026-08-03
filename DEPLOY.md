# Put Command Center online — free, permanent, no terminal

You get a private URL that works on your laptop and phone from anywhere.
Storage is permanent. Cost is zero on Cloudflare's free tier.
Takes about 5 minutes, all in a web dashboard.

---

## 1. Make a Cloudflare account

Go to **dash.cloudflare.com/sign-up**. Email and password. No card needed.

## 2. Create the worker

In the left sidebar: **Compute (Workers)** → **Create** → **Start with Hello World**
→ **Deploy**.

You now have a live URL like `command-center.yourname.workers.dev`.

## 3. Paste the app in

Click **Edit code** (top right). Select everything in the editor and delete it.
Run `npm run build`, open `dist/worker.js`, copy the whole file, paste it
in. Click **Deploy**.

## 4. Add storage

Go back to the worker → **Settings** → **Bindings** → **Add** → **KV namespace**.

- If the dropdown is empty, click the link to create one first. Name it `cc-data`.
- **Variable name** must be exactly: `CC`
- Pick the `cc-data` namespace → **Deploy**

## 5. Set your password

Same **Bindings** page → **Add** → **Secret** (or Environment Variable, then tick
Encrypt).

- **Variable name** must be exactly: `PASSWORD`
- **Value**: whatever you want to type once per device
- **Deploy**

## 6. Open it

Visit your worker URL. It asks for the password once, then remembers that device.

Done. Every change saves to Cloudflare automatically. Open the same URL on your
phone, enter the password once, same board.

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

Run `npm run build`, then Edit code → select all → paste `dist/worker.js` → Deploy.
Your data lives in KV and is untouched by this.

## Limits on the free tier

100,000 requests a day. You will use a few hundred. Not a concern.

## A note on the password

This keeps casual visitors out. It is not bank-grade security, and anyone with
your URL and password has full access. Do not put anything in here you would be
harmed by leaking. For stronger protection, Cloudflare Access (also free for
personal use) can put a real login in front of the whole worker.
