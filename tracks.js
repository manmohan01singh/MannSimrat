/* MannSimrat — track library (v2)
 *
 * Every videoId below was verified by hand on 2026-11-25 against the
 * official Sabad Naad YouTube channel (@sabadnaad, UCGQ1CCvmvoOPIujrxuqrIMA)
 * via YouTube oEmbed: each one returns author_name "Sabad Naad" and the
 * matching title. No ID was invented.
 *
 * Left OUT (could not be verified as a Sabad Naad channel video, so they
 * are NOT in the playable list): Paarbraham Parmesar, Kar Saadhoo,
 * Har Jann Gunn, Dukh Bhanjan, Mere Mann Raam Naam, Veeaahu Hoa Mere
 * Baabulaa (all confirmed on JioSaavn as Vol 5 tracks, but no Sabad Naad
 * YouTube video found); Preya Kee Preet and Kaisee Aarti (found only as
 * YouTube Music "Topic" auto-videos, not the Sabad Naad channel).
 * Long-term goal: all 141 Sabads. To add one, append an entry here with
 * a verified videoId — the picker, filter and palettes pick it up
 * automatically. Gurmukhi titles are included only where verified;
 * add titleGu when the verified Gurmukhi text is known.
 *
 * Palette per track: a=accent, d=deep accent, t=page tint,
 * o1/o2=orb colours, g=gold. Applied as CSS variables on :root.
 */

window.MANNSIMRAT_TRACKS = [
  // ---- Vol 5 · Evening (default first) ----
  { id: 'mann-simrat', videoId: 'KQ-wcUDV2a8',
    titleEn: 'Mann Simrat Thanda Theevan Jeeo', titleGu: 'ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ',
    artist: 'Padma Shri Arijit Singh', raag: 'Maajh', volume: 5, volName: 'Vol 5 · Evening',
    bani: 'Sri Guru Arjan Dev Ji', durationSec: 531,
    palette: { a: '#2aa7b0', d: '#1d8a96', t: '#eefafb', o1: '#a8e3e8', o2: '#f2e3b8', g: '#d9b45b' } },
  { id: 'maindaa-mann-rattaa', videoId: 'cp-UnoWWISE',
    titleEn: 'Maindaa Mann Rattaa', artist: 'Bhai Gagandeep Singh', raag: 'Maaroo Kaafee',
    volume: 5, volName: 'Vol 5 · Evening', bani: '', durationSec: 698,
    palette: { a: '#0f766e', d: '#115e59', t: '#eef7f5', o1: '#99d5cf', o2: '#fde68a', g: '#b45309' } },
  { id: 'madhsoodan', videoId: 'uyTGiddwRKw',
    titleEn: 'Madhsoodan', artist: 'Bhai Rai Singh (Darbar Sahib)', raag: 'Maajh',
    volume: 5, volName: 'Vol 5 · Evening', bani: 'Sri Guru Ram Das Ji', durationSec: 420,
    palette: { a: '#b45309', d: '#92400e', t: '#fdf6ec', o1: '#fcd9a8', o2: '#fde68a', g: '#92400e' } },
  { id: 'herat-herat', videoId: 'pV39zFVi73s',
    titleEn: 'Herat Herat', artist: 'Hariharan', raag: 'Raamkalee Dakkhanee',
    volume: 5, volName: 'Vol 5 · Evening', bani: 'Sri Guru Nanak Dev Ji', durationSec: 365,
    palette: { a: '#6d28d9', d: '#5b21b6', t: '#f5f0fd', o1: '#c4b5fd', o2: '#fbcfe8', g: '#a16207' } },
  { id: 'tum-gaavaho', videoId: 'GwsX9khkX-Y',
    titleEn: 'Tum Gaavaho', artist: 'Dr. Alankar Singh', raag: 'Gaorhee Poorbee Deepakee',
    volume: 5, volName: 'Vol 5 · Evening', bani: 'Sri Guru Nanak Dev Ji', durationSec: 760,
    palette: { a: '#be185d', d: '#9d174d', t: '#fdf0f5', o1: '#f9a8d4', o2: '#fde68a', g: '#b45309' } },

  // ---- Vol 1 · Daybreak ----
  { id: 'mai-banjaaran', videoId: 'nBP7-5oJQTg',
    titleEn: 'Mai Banjaaran Raam Ki', artist: 'Dr. Ashwini Bhide-Deshpande', raag: 'Gaorhee Bairaagan',
    volume: 1, volName: 'Vol 1 · Daybreak', bani: 'Sri Guru Nanak Dev Ji', durationSec: 485,
    palette: { a: '#9f1239', d: '#881337', t: '#fdf0f3', o1: '#fda4af', o2: '#fde68a', g: '#a16207' } },
  { id: 'meraa-har-prabh', videoId: 'ET9gofN6ZTA',
    titleEn: 'Meraa Har Prabh', artist: 'Pt. Sanjeev Abhyankar', raag: 'Bilaawal Mangal',
    volume: 1, volName: 'Vol 1 · Daybreak', bani: 'Sri Guru Ram Das Ji', durationSec: 414,
    palette: { a: '#c2410c', d: '#9a3412', t: '#fdf3ec', o1: '#fdba74', o2: '#fde68a', g: '#92400e' } },
  { id: 'har-ko-naam', videoId: 'WnsLQodVnkw',
    titleEn: 'Har Ko Naam', artist: 'Bhai Gurmeet Singh', raag: 'Prabhaatee Bibhaas',
    volume: 1, volName: 'Vol 1 · Daybreak', bani: 'Sri Guru Tegh Bahadur Ji', durationSec: 582,
    palette: { a: '#4338ca', d: '#3730a3', t: '#eef0fd', o1: '#a5b4fc', o2: '#fbcfe8', g: '#a16207' } },
  { id: 'logaa-bharam', videoId: 'grwjlqWyMH8',
    titleEn: 'Logaa Bharam Naa Bhoolahu Bhai', artist: 'Ronkini Gupta', raag: 'Prabhaatee',
    volume: 1, volName: 'Vol 1 · Daybreak', bani: 'Bhagat Kabir Ji', durationSec: 432,
    palette: { a: '#1d4ed8', d: '#1e40af', t: '#eef4fd', o1: '#93c5fd', o2: '#fde68a', g: '#b45309' } },

  // ---- Vol 2 · Morning ----
  { id: 'hum-ghar-saajan', videoId: 'ja5hUkzQczw',
    titleEn: 'Hum Ghar Saajan', artist: 'Rekha Bhardwaj', raag: 'Soohee',
    volume: 2, volName: 'Vol 2 · Morning', bani: 'Sri Guru Nanak Dev Ji', durationSec: 399,
    palette: { a: '#db2777', d: '#be185d', t: '#fdf0f6', o1: '#f9a8d4', o2: '#fbcfe8', g: '#a16207' } },
  { id: 'mero-sunder', videoId: 'wv0TRBBUjX0',
    titleEn: 'Mero Sunder', artist: 'Devenderpal Singh', raag: 'Devgandhaaree',
    volume: 2, volName: 'Vol 2 · Morning', bani: 'Sri Guru Ram Das Ji', durationSec: 472,
    palette: { a: '#047857', d: '#065f46', t: '#ecfdf5', o1: '#6ee7b7', o2: '#fde68a', g: '#b45309' } },
  { id: 'jaa-too-taa-main', videoId: '9oG93IpINLw',
    titleEn: 'Jaa Too Taa Main', artist: 'Rajwinder Kaur', raag: 'Soohee',
    volume: 2, volName: 'Vol 2 · Morning', bani: 'Sri Guru Nanak Dev Ji', durationSec: 634,
    palette: { a: '#0369a1', d: '#075985', t: '#eef6fd', o1: '#7dd3fc', o2: '#fde68a', g: '#a16207' } },
  { id: 'aaj-naame-beethhal', videoId: '99Yq0Zx7qK0',
    titleEn: 'Aaj Naame Beethhal', artist: 'Bhai Harbaljit Singh, Bhai Gurmeet Singh', raag: 'Bilaawal Gond',
    volume: 2, volName: 'Vol 2 · Morning', bani: 'Bhagat Nam Dev Ji', durationSec: 417,
    palette: { a: '#4d7c0f', d: '#3f6212', t: '#f4f8ec', o1: '#bef264', o2: '#fde68a', g: '#92400e' } },
  { id: 'merai-mann-prem', videoId: 'wmR5-P7tRP8',
    titleEn: 'Merai Mann Prem', artist: 'Harshdeep Kaur', raag: 'Gond',
    volume: 2, volName: 'Vol 2 · Morning', bani: 'Sri Guru Ramdas Ji', durationSec: 395,
    palette: { a: '#c026d3', d: '#a21caf', t: '#fbf0fd', o1: '#e879f9', o2: '#fde68a', g: '#a16207' } },
  { id: 'hau-aayaa', videoId: 'GZytERvUMvs',
    titleEn: 'Hau Aayaa Doorahu Chal Ke', artist: 'Bhai Satvinder Singh, Bhai Harvinder Singh', raag: 'Soohee',
    volume: 2, volName: 'Vol 2 · Morning', bani: 'Sri Guru Arjan Dev Ji', durationSec: 507,
    palette: { a: '#0d9488', d: '#0f766e', t: '#ecfdfb', o1: '#5eead4', o2: '#fde68a', g: '#b45309' } },

  // ---- Vol 3 · Noon ----
  { id: 'mundh-navelarhiyaa', videoId: 'ODwH0azpSJo',
    titleEn: 'Mundh Navelarhiyaa', artist: 'Aruna Sairam', raag: 'Bilaawal Dakkhanee',
    volume: 3, volName: 'Vol 3 · Noon', bani: 'Sri Guru Nanak Dev Ji', durationSec: 561,
    palette: { a: '#7e22ce', d: '#6b21a8', t: '#f7f0fd', o1: '#d8b4fe', o2: '#fbcfe8', g: '#a16207' } },

  // ---- Vol 4 · Afternoon ----
  { id: 'aiso-sahaaee', videoId: 'ta7U8lKHtZ8',
    titleEn: 'Aiso Sahaaee', artist: 'Shankar Mahadevan', raag: 'Maalee Gaorhaa',
    volume: 4, volName: 'Vol 4 · Afternoon', bani: 'Sri Guru Arjan Dev Ji', durationSec: 712,
    palette: { a: '#a16207', d: '#854d0e', t: '#fdf8ec', o1: '#fde047', o2: '#fdba74', g: '#92400e' } },

  // ---- Vol 6 · Night ----
  { id: 'mann-jaapahu', videoId: 's2iz8y8y9T4',
    titleEn: 'Mann Jaapahu', artist: 'Dr. Gurnam Singh', raag: 'Kaanarhaa',
    volume: 6, volName: 'Vol 6 · Night', bani: 'Sri Guru Ramdas Ji', durationSec: 497,
    palette: { a: '#1e40af', d: '#1e3a8a', t: '#edf1fd', o1: '#93c5fd', o2: '#c4b5fd', g: '#a16207' } },
  { id: 'har-kee-gat', videoId: 'lHPIgSjeSu4',
    titleEn: 'Har Kee Gat', artist: 'Gundecha Brothers', raag: 'Bihaagarhaa',
    volume: 6, volName: 'Vol 6 · Night', bani: 'Sri Guru Tegh Bahadur Ji', durationSec: 650,
    palette: { a: '#15803d', d: '#166534', t: '#ecf9f0', o1: '#86efac', o2: '#fde68a', g: '#b45309' } },
  { id: 'raam-hau-kya-jaana', videoId: '0YJmkCRZxp4',
    titleEn: 'Raam Hau Kya Jaana', artist: 'Bhai Sandeep Singh (Darbar Sahib)', raag: 'Nat Naaraain',
    volume: 6, volName: 'Vol 6 · Night', bani: 'Sri Guru Arjan Dev Ji', durationSec: 472,
    palette: { a: '#78350f', d: '#451a03', t: '#f8f1e8', o1: '#d6a77a', o2: '#fde68a', g: '#92400e' } },
];

window.MANNSIMRAT_VOLUMES = [
  { n: 1, label: 'Vol 1 · Daybreak' },
  { n: 2, label: 'Vol 2 · Morning' },
  { n: 3, label: 'Vol 3 · Noon' },
  { n: 4, label: 'Vol 4 · Afternoon' },
  { n: 5, label: 'Vol 5 · Evening' },
  { n: 6, label: 'Vol 6 · Night' },
];
