# MannSimrat — Mann Simrat — Thanda Theevan Jeeo (v3)

Project name: **MannSimrat**. Site title: “Mann Simrat — Thanda Theevan Jeeo”.
(The code lives in `thanda-theeve-loop/` for now; the MannSimrat repo /
Vercel naming is handled by QA/Deploy.)

**ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ — Mann Simrat Thanda Theevan Jeeo**
Padma Shri Arijit Singh • Sabad Naad Vol 5 • Raag Maajh

Official video: https://www.youtube.com/watch?v=KQ-wcUDV2a8

No audio is copied, downloaded or hosted here. Playback streams from the
official Sabad Naad YouTube embed (YouTube IFrame API, `loop=1`).

## v3 — full redesign (Manmohan asked, 2026-11-25)

v2 was too busy — a 20-track library, reverb controls, paragraphs of
text. v3 is the simple version he wanted:

- **One track only.** Mann Simrat. No library, no search, no Next/Prev,
  no other tracks. (`tracks.js` deleted.)
- **Two options only.** **Loop** — a frosted pill alone at the top,
  above Play, ON by default. **Play** — one big iOS-like white circle
  below the album art. Nothing else to tap.
- **Almost no text.** Two lines only: the Gurmukhi title and
  “Mann Simrat · Arijit Singh”. No notes, no footer, no hints.
- **No reverb in YouTube mode.** It can never process the YouTube
  track (cross-origin), so there is no reverb control there at all.
  Reverb exists only in file mode — see below.
- **The screen stays alive.** Slow-shifting cream/teal/gold gradient
  and five large drifting orbs. (Falling petals were in the first v3
  build and removed the same day on Manmohan's word.)
  `prefers-reduced-motion` stops the motion.
- Big album art in the centre (official thumbnail, `maxresdefault.jpg`
  with `hqdefault.jpg` fallback), soft shadow + teal glow, 28px radius.
- A thin quiet progress line under the title — no numbers, click to seek.
- **Your own file (added same day, Manmohan approved).** One small
  quiet “♪ Apni file” pill under Play. Pick an audio file from your
  own device and it plays in the page through a **real** convolver
  reverb (`MediaElementSource → dry gain + convolver wet gain`,
  generated 2.8 s hall impulse). In file mode only, a small
  **Reverb: On/Off** toggle + **Intensity** slider appears (wet level
  0.25 at 0%, 0.525 at 50%, 0.80 at 100% — the v2 fix levels).
  Play/Pause, Loop and the progress line all control the file.
  The pill becomes “▶ YouTube” — tap it to go back. The file never
  leaves the device: no upload, no hosting, nothing stored.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Loop pill, album art, two-line title, progress line, Play circle, “Apni file” pill + file-mode reverb row, hidden YouTube player |
| `styles.css` | Living gradient background, drifting orbs, frosted Loop pill, big Play circle, quiet file pill + gold file-mode reverb controls, TV-first layout (no scroll at 1920×1080) |
| `app.js` | YouTube IFrame API playback (single video), Loop, Play/Pause, progress + seek, local-file mode with real convolver reverb, keyboard shortcuts |
| `README.md` | This file |

## Run locally

Any static server works — no build step:

```bash
cd thanda-theeve-loop
python3 -m http.server 8000
# open http://localhost:8000
```

Or open `index.html` directly in a browser (YouTube embed still needs
internet).

## Deploy to Vercel

No build step, no framework — deploy as a static site:

**Option A — Vercel dashboard (recommended)**
1. Push this folder to a GitHub repo (or import it as a project root).
2. In the Vercel dashboard: Add New → Project → import the repo.
3. Framework preset: **Other**. No build command, no output directory change.
4. Deploy. The site is live at `https://<project>.vercel.app`.

**Option B — Vercel CLI**
```bash
npx vercel --prod
# accept defaults; no build step
```

## Controls

- **Play / Pause** — the big circle, focused on load. No autoplay with
  sound (browser policy); press Play once and it starts.
- **Loop** — the pill at the top, ON by default.
- **Progress line** — click anywhere on it to seek.
- **♪ Apni file** — pick an audio file from your device; it plays with
  real reverb (toggle + intensity shown only in file mode). Tap
  **▶ YouTube** to go back to the Mann Simrat stream.

Keyboard: `Space` play/pause, `L` loop, `←`/`→` seek 10s (when the
progress line is focused).

## Credit

Audio streams from the official Sabad Naad YouTube video.
