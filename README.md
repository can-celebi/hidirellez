# Hıdırellez 🌹

A small rose tree on the internet, for friends scattered across cities.

On the night of May 5th into May 6th — Hıdırellez, the meeting of Hızır and İlyas — the old custom is to write a wish on a slip of paper and bury it at the roots of a rose tree. When the wish comes true, you dig it up.

This is a static page that lets people do that together. Wishes are encrypted in the browser with a password the wisher chooses, then stored as opaque ciphertext in a Google Sheet (via a tiny Apps Script). Even the gardener (you) can't read them.

## How it works

```
 [browser]              [Apps Script web app]          [Google Sheet]            [browser]
   wish + password   →   POST {label, ciphertext}   →   appended row        ←    GET → JSON
   AES-GCM(PBKDF2)                                                               decrypts on click
```

- **Encryption**: AES-GCM-256, key derived via PBKDF2-SHA256 with 250,000 iterations and a fresh 16-byte salt. A 12-byte IV is also fresh per wish. `salt + iv + ciphertext` are concatenated and base64-encoded — that single opaque string is all that ever leaves the browser.
- **Storage**: a Google Sheet, written and read by a tiny Google Apps Script web app deployed under your account.
- **No accounts, no emails.** A wisher picks a label (so they can find their bundle later) and a password (the only thing that can open it). There is no recovery — that's the point.

## Setup — step by step

You'll need a Google account. The whole thing is two files to paste and two URLs to copy.

### Step 1 — Open Google Apps Script

1. In a browser logged into the Google account you want to host the wishes from, go to **<https://script.google.com>**.
2. Click **"New project"** (top-left, big plus or "+ New project" button).
3. A code editor opens with a file called `Code.gs` containing a starter `function myFunction() {}`.

### Step 2 — Paste the backend code

1. Open `apps-script.gs` from this repo (the file sitting next to this README).
2. Select all of it, copy it.
3. In the Apps Script editor, **delete everything** in `Code.gs` and paste the contents in.
4. Click the **disk icon** (or Ctrl/Cmd-S) to save. Name the project anything — "Hıdırellez" works.

### Step 3 — Deploy as a web app

1. Top-right, click **"Deploy" → "New deployment"**.
2. Click the **gear icon** next to "Select type" and choose **"Web app"**.
3. Fill in:
   - **Description**: anything (e.g. "hidirellez v1")
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone** ← important; this is what lets your friends submit wishes without needing a Google account
4. Click **"Deploy"**.
5. Google will ask you to **authorize** the script the first time:
   - Click "Authorize access"
   - Pick your Google account
   - You may see a "Google hasn't verified this app" warning — click **"Advanced" → "Go to Hıdırellez (unsafe)"**. This is normal for personal scripts; you're authorizing your own code.
   - Click **"Allow"** on the permissions screen (it asks to manage spreadsheets and run as you).
6. After deployment, copy the **Web app URL**. It looks like:
   ```
   https://script.google.com/macros/s/AKfycbz...long.../exec
   ```

### Step 4 — Paste the URL into config.js

Open `config.js` in this repo and replace the placeholder:

```js
window.HIDIRELLEZ_CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbz.../exec",  // ← paste here
  REPO_URL:        "https://github.com/your-name/hidirellez"               // ← optional
};
```

That's the entire backend setup. The first time someone plants a wish, the script auto-creates a Google Sheet called **"Hıdırellez Wishes"** in your Drive.

### Step 5 — Test it locally

```bash
cd hidirellez
python3 -m http.server 8000
# open http://localhost:8000
```

Plant a test wish, then walk to the garden and try to dig it up with the password. If both work, you're ready.

### Step 6 — Publish on GitHub Pages

```bash
cd hidirellez
git init
git add .
git commit -m "plant a rose tree"
git branch -M main
git remote add origin git@github.com:<you>/hidirellez.git
git push -u origin main
```

In the repo on GitHub: **Settings → Pages → Source: Deploy from branch → main / root → Save**.
After ~30s the site is live at `https://<you>.github.io/hidirellez/`.

## If something goes wrong

- **"Could not bury the wish: ..."** → the deployment URL is wrong, or you set "Execute as: User accessing the web app" instead of "Me". Re-deploy with the correct setting.
- **"Could not read the garden: ..."** → same — the Apps Script URL is wrong, or you didn't deploy with "Anyone" access.
- **Garden stays empty after planting** → check the Google Sheet directly (it's in your Drive under "Hıdırellez Wishes"). If the row is there, it's just a fetch cache; reload.
- **You changed the script and want the change live** → "Deploy → Manage deployments → pencil icon → Version: New version → Deploy". Reusing the same deployment keeps the same URL.

## Files

- `index.html` — landing, plant form, garden, dig-up modal
- `styles.css` — night-garden styling
- `app.js` — WebCrypto encrypt/decrypt + POST/GET to the Apps Script
- `config.js` — your Apps Script URL (the only thing you edit)
- `apps-script.gs` — the backend; pasted into script.google.com once
- `README.md` — this file

## Trust model

- **What you (the gardener) see**: a label, a timestamp, and a base64 blob in the sheet. Labels are plaintext and chosen by the wisher — tell people not to put anything sensitive in the label itself.
- **What visitors see**: the same label list (the page reads the sheet through the script).
- **What can decrypt**: only someone who knows the password. AES-GCM is authenticated, so a wrong password fails cleanly without leaking anything.
- **What is not protected**: if someone forgets their password, the wish is sealed forever. That's the deal.

## Hıdırellez kutlu olsun. 🌹
