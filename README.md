# MannSimrat — Mann Simrat — Thanda Theevan Jeeo (v2)

Project name: **MannSimrat**. Site title: “Mann Simrat — Thanda Theevan Jeeo”.
(The code lives in `thanda-theeve-loop/` for now; the MannSimrat repo /
Vercel naming is handled by QA/Deploy.)

A light, TV-first loop player for **20 verified Sabad Naad tracks**, with
Mann Simrat as the hero on load:

**ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ — Mann Simrat Thanda Theevan Jeeo**
Padma Shri Arijit Singh • Sabad Naad Vol 5 • Raag Maajh
Bani by Sri Guru Arjan Dev Ji

Official video: https://www.youtube.com/watch?v=KQ-wcUDV2a8

No audio is copied, downloaded or hosted here. Playback streams from the
official Sabad Naad YouTube embeds (YouTube IFrame API, `loop=1`).

## v2 — what changed

- **Reverb fixed (it was effectively silent).** v1 maxed the hall layer at
  0.05 gain and defaulted to 0.0175 — a lowpassed noise bed you could not
  hear on TV speakers. v2: a soft Raag Maajh drone (Sa–Pa–Sa, tanpura-like,
  slow breathing LFO) + filtered noise bed through a long convolver hall.
  Master gain at default 50% / Hall ≈ **0.14** (v1: 0.0175), 0.25 at 100%.
  Presets: **Hall** (2.8 s decay), **Temple** (4.6 s, ×1.25 level),
  **Soft** (1.7 s, ×0.6). Intensity changes wet level + master gain
  audibly. Button shows `Reverb: On • Hall 50%`, and a “● Reverb on”
  pill appears on the album art. AudioContext is created/resumed on the
  Play gesture and on the Reverb tap (TV browsers included).
- **Track library: 20 playable tracks.** Searchable list, filter by
  Volume (segmented control), Next / Previous buttons (keys `N` / `P`).
  Every track has its own colour palette — background tint, orbs, album
  glow and accent all change when the track changes. Album art is that
  track's own YouTube thumbnail. Switching loads the new video with
  `loadVideoById`, updates title/artist/raag/volume/palette/thumbnail/
  progress, keeps the Loop setting, and starts playing if Play was on.
- **Design: iOS-like clean.** Frosted-glass cards, big rounded corners,
  soft shadows, white space, Inter/system type. Orbs and petals kept
  but subtler. Still no page scroll at 1920×1080; the library is a side
  panel on wide screens and stacks below on phones.

## The 20 tracks (all verified 2026-11-25)

Every videoId was checked against the official Sabad Naad YouTube channel
(@sabadnaad) via YouTube oEmbed — each returns author “Sabad Naad” and
the matching title. See `tracks.js` for the full data + palettes, and for
the list of tracks that were left out because no Sabad Naad channel video
could be verified for them.

- **Vol 5 · Evening (5):** Mann Simrat (Arijit Singh, Maajh), Maindaa Mann
  Rattaa (Bhai Gagandeep Singh, Maaroo Kaafee), Madhsoodan (Bhai Rai Singh,
  Maajh), Herat Herat (Hariharan, Raamkalee Dakkhanee), Tum Gaavaho
  (Dr. Alankar Singh, Gaorhee Poorbee Deepakee)
- **Vol 1 · Daybreak (4):** Mai Banjaaran Raam Ki (Dr. Ashwini Bhide-
  Deshpande, Gaorhee Bairaagan), Meraa Har Prabh (Pt. Sanjeev Abhyankar,
  Bilaawal Mangal), Har Ko Naam (Bhai Gurmeet Singh, Prabhaatee Bibhaas),
  Logaa Bharam Naa Bhoolahu Bhai (Ronkini Gupta, Prabhaatee)
- **Vol 2 · Morning (6):** Hum Ghar Saajan (Rekha Bhardwaj, Soohee),
  Mero Sunder (Devenderpal Singh, Devgandhaaree), Jaa Too Taa Main
  (Rajwinder Kaur, Soohee), Aaj Naame Beethhal (Bhai Harbaljit Singh,
  Bhai Gurmeet Singh, Bilaawal Gond), Merai Mann Prem (Harshdeep Kaur,
  Gond), Hau Aayaa Doorahu Chal Ke (Bhai Satvinder/Harvinder Singh, Soohee)
- **Vol 3 · Noon (1):** Mundh Navelarhiyaa (Aruna Sairam, Bilaawal Dakkhanee)
- **Vol 4 · Afternoon (1):** Aiso Sahaaee (Shankar Mahadevan, Maalee Gaorhaa)
- **Vol 6 · Night (3):** Mann Jaapahu (Dr. Gurnam Singh, Kaanarhaa),
  Har Kee Gat (Gundecha Brothers, Bihaagarhaa), Raam Hau Kya Jaana
  (Bhai Sandeep Singh, Nat Naaraain)

Long-term goal: all 141 Sabads. To add one, append an entry to `tracks.js`
with a verified videoId — the picker, filter and palettes pick it up
automatically.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page structure, album art, controls, reverb presets, honest reverb note, track library panel, footer credit |
| `styles.css` | iOS-like frosted glass, per-track CSS variables, side library panel, subtler orbs + petals, TV-first layout (no scroll at 1920×1080) |
| `tracks.js` | 20 verified tracks + per-track palettes (the only file to touch to add a track) |
| `app.js` | YouTube IFrame API playback, track switching, progress/volume/loop, v2 hall reverb + real local-file reverb, keyboard shortcuts |
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

- **Play / Pause** — big button, focused on load. No autoplay with sound
  (browser policy); press Play once and it starts.
- **Loop** — ON by default, highlighted. Kept across track switches.
- **Restart** — seeks to 0:00 and plays.
- **Prev / Next** — step through the currently filtered track list (wraps).
- **Progress bar + current / total time** — drag to seek.
- **Volume slider** — controls YouTube volume, and local-file volume too.
- **Reverb** — toggle + Hall/Temple/Soft presets + intensity slider.
  Button shows state and %, e.g. `Reverb: On • Hall 50%`.
- **Show video** — reveals the official YouTube player under the controls.
  The album art is the main visual; the player is the audio source.
- **Track library** — search box, volume filter, click a track to play it.

Keyboard: `Space` play/pause, `L` loop, `R` reverb, `N` next, `P` previous.

## Reverb — read this, it matters

YouTube iframe audio is cross-origin and **cannot** be routed through the
Web Audio API, so no site can honestly claim to put reverb on the YouTube
track itself. This site does not claim that.

It implements reverb in two honest ways:

1. **Hall ambience (YouTube mode)** — when Reverb is on, you hear a
   clearly audible hall layer *underneath* the YouTube track: a soft
   Raag Maajh drone (Sa–Pa–Sa) plus a filtered noise bed, through a
   generated-impulse convolver. Presets change decay and level; intensity
   changes wet level and master gain. Measured via an AnalyserNode:
   `window.__thandaTheeve.getReverbLevel()` reports RMS + gains.
   It adds spaciousness; it does not process the YouTube audio.
2. **Real reverb (local-file mode)** — drop or choose an MP3 of the track
   in the “Your own file” box. That file plays locally in your browser
   through a real convolver (`MediaElementSource → dry gain + convolver →
   wet gain`). Here the reverb toggle, preset and intensity truly apply
   reverb to the track. Nothing is uploaded. “Back to YouTube” returns
   to the official stream.

## Design notes

- Background: white / soft cream-white, gentle light from the edges,
  centred on the album art; tint follows the current track's palette.
- Album art: that track's official thumbnail
  (`maxresdefault.jpg`, falls back to `hqdefault.jpg`).
- 6 CSS-only drifting orbs + 10 gentle falling petals, slow and subtle.
  `prefers-reduced-motion` disables them.
- TV-first: `clamp()` + `vh` sizing, large hit targets, no scrolling
  needed at 1920×1080. Library panel is a frosted-glass side card on
  wide screens, stacks below on phones.

## Credit

Audio streams from official Sabad Naad YouTube.
Footer links to the official video and to a Spotify search for the track.
