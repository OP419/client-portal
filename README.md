# Client Portal — Setup Guide

A minimal, secure client portal: clients get a magic-link email to sign in,
then see only their own reports/files, ready to download. Cost to run: **$0/month**
on Supabase + Vercel free tiers until you outgrow them.

Follow these steps in order. None of them require writing new code — copy,
paste, click.

## 1. Create a Supabase project (~5 min)

1. Go to https://supabase.com → sign up (free) → "New project".
2. Pick any name/password/region. Wait for it to finish provisioning.
3. In the left sidebar, go to **SQL Editor** → **New query**.
4. Open `supabase/schema.sql` from this folder, paste its full contents in, and click **Run**.
   This creates the `clients`, `client_users`, and `files` tables, and locks
   them down so each client can only ever see their own data.
5. Go to **Storage** (left sidebar) → **New bucket** → name it exactly `client-files` →
   set it to **Private** (not public) → Create.
6. Go to **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key — you'll need both in step 3.
7. Go to **Authentication → Providers**, make sure **Email** is enabled
   (it is by default). Go to **Authentication → URL Configuration** and add
   your future site URL (you'll fill this in after step 4) to "Redirect URLs",
   e.g. `https://your-app.vercel.app/auth/callback`.

## 2. Push this code to GitHub (~2 min)

1. Create a new empty repository on GitHub (e.g. `client-portal`).
2. Upload this whole folder's contents to it (drag-and-drop on GitHub's web
   UI works fine, or `git init` / `git add .` / `git commit` / `git push` if
   you're comfortable with git).

## 3. Deploy on Vercel (~3 min)

1. Go to https://vercel.com → sign up (free) with your GitHub account.
2. **Add New → Project** → pick the `client-portal` repo you just pushed.
3. Before deploying, expand **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL from step 1.6
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon public key from step 1.6
4. Click **Deploy**. In ~1 minute you'll get a live URL like
   `https://client-portal-yourname.vercel.app`.
5. Go back to Supabase → Authentication → URL Configuration and make sure
   that exact URL + `/auth/callback` is in the Redirect URLs list (step 1.7).

Your portal is now live.

## 4. Add your first client + file (~2 min, do this each time you onboard a client)

In Supabase → **Table Editor**:

1. Open `clients` → Insert row → set `name` to the client's company name → Save.
   Copy the `id` (uuid) it generates.
2. Have the client sign in once on your live portal URL (they'll get a magic
   link email, click it, land on an empty dashboard). This creates their row
   in Supabase's built-in `auth.users` table.
3. In **Authentication → Users**, find their email, copy their **User UID**.
4. Open `client_users` → Insert row → `user_id` = their User UID from step 3,
   `client_id` = the client id from step 1 → Save.
5. In **Storage → client-files**, create a folder named exactly the client's
   `id` (uuid), and upload their report file(s) into it.
6. Open `files` → Insert row → `client_id` = the client id, `name` = a
   friendly display name (e.g. "July 2026 Forecast"), `storage_path` =
   `<client_id>/<filename>` matching what you uploaded → Save.

Refresh their dashboard — the file now appears, downloadable, and invisible
to every other client.

## What's deliberately left out (for a v1)

- An admin screen for steps 4.1–4.6 (right now you do it by hand in Supabase's
  table editor, which is fine for a handful of clients). I can build a simple
  admin page for this once you have the basics live and want to speed that part up.
- Custom domain — Vercel supports adding one for free once you're ready.
- File uploads *from* the client — this version is one-way (you → client).
  Easy to add later if you need it.
