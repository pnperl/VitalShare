# App in Need • LPG Buddy (C2C MVP)

A lightweight static website to help renters (students, aspirants, workers) find nearby LPG cylinder owners for short-term C2C rentals.

## Local run

```bash
python3 -m http.server 4173
```

Open: `http://localhost:4173`

---

## Free deployment options

### 1) Deploy on **Netlify** (easy)
1. Push this folder to a GitHub repo.
2. Go to Netlify → **Add new site** → **Import from Git**.
3. Select repo.
4. Build command: *(leave empty)*.
5. Publish directory: `.`
6. Click **Deploy site**.

### 2) Deploy on **Vercel** (easy)
1. Push code to GitHub.
2. Go to Vercel → **New Project**.
3. Import repository.
4. Framework preset: **Other**.
5. Build command: *(empty)*, Output directory: `.`
6. Deploy.

### 3) Deploy with **GitHub Pages** (100% free)
1. Push code to a GitHub repo.
2. Go to **Settings → Pages**.
3. Source: **Deploy from a branch**.
4. Branch: `main` (or your default branch), folder: `/ (root)`.
5. Save and wait for the Pages URL.

---

## Live deployment fix (styles not visible)
If your deployment showed unstyled HTML before, this version inlines the main CSS inside `index.html`, so style does not depend on external CSS loading.

Also verify:
- `index.html` and `script.js` are in the same deployed folder.
- path uses `./script.js` (already updated).
- browser cache is hard refreshed (`Ctrl+Shift+R` / `Cmd+Shift+R`).

---

## Notes for next version
- Add OTP login and verified user badges.
- Add exact map pins and distance sorting.
- Add in-app chat/WhatsApp connect and booking request flow.
