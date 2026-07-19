# WPWS Website Onboarding

Client intake for the Wellness Pro Website System. React + Vite, saving to Supabase,
syncing to Notion on submit.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Put it on GitHub

```bash
git init
git add .
git commit -m "WPWS client intake"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/wpws-intake.git
git push -u origin main
```

(Create the empty repo on github.com first, without a README, so the push isn't rejected.)

## Deploy to Vercel

1. vercel.com → **Add New** → **Project**
2. Import the `wpws-intake` repo
3. Vercel detects Vite on its own. Leave every setting as-is.
4. **Deploy**

You'll get a URL like `wpws-intake.vercel.app`. Every push to `main` redeploys automatically.

## What's already wired

- **Autosave** to Supabase, debounced, with resume-by-email
- **Revision history** — every prior version of an intake is retained server-side
- **Notion sync** — a row appears in *WPWS Website Clients* when someone starts,
  and the full write-up lands in the page body when they submit

Nothing needs configuring for these. The Supabase publishable key in
`src/IntakeWizard.jsx` is safe to commit: the intake table has row-level security
enabled with no policies, so all access runs through two locked-down database
functions.

## Fonts

The design calls for **Boston Angel** (headings) and **Proxima Nova** (everything else).
Neither is a Google font, so the CSS falls back to Playfair Display and Figtree until
the real ones are loaded. To add them:

1. Put the licensed webfont files in `public/fonts/`
2. Add `@font-face` rules to `index.html`
3. The CSS variables `--font-display` and `--font-ui` in `IntakeWizard.jsx` already
   list the real names first, so they'll take over automatically.

## Before real clients use it

- **Email-only sign-in** means anyone who knows a client's email could open their
  intake. Fine for review; upgrade to Supabase magic links before launch.
- Two unrelated tables in the Supabase project (`clients`,
  `students_ads_made_simple`) have RLS disabled. Worth fixing separately.
