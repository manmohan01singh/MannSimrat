/* MannSimrat — v2
 *
 * Default track: "Mann Simrat Thanda Theevan Jeeo" — ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ
 * by Padma Shri Arijit Singh, Sabad Naad Vol 5, Raag Maajh.
 * Bani by Sri Guru Arjan Dev Ji. Official YouTube video ID: KQ-wcUDV2a8.
 *
 * Track library lives in tracks.js (20 verified Sabad Naad videos).
 * No audio is copied, downloaded or hosted here. Playback streams
 * from the official Sabad Naad YouTube embeds (YouTube IFrame API).
 *
 * REVERB — HONEST DESIGN (v2 fix)
 * YouTube iframe audio is cross-origin and CANNOT be routed through
 * the Web Audio API, so reverb can never process the YouTube track.
 * This file does NOT claim otherwise. What v2 does:
 *  (1) a clearly AUDIBLE hall layer underneath the YouTube track: a soft
 *      Raag Maajh drone (Sa–Pa–Sa, tanpura-like, slow breathing LFO)
 *      plus a filtered noise bed, both through a long convolver hall.
 *      Master gain at default 50% / Hall is ~0.14 (v1 maxed at 0.05
 *      and defaulted to 0.0175 — effectively silent on TV speakers).
 *      Presets Hall / Temple / Soft change decay + level; Intensity
 *      changes wet level and master gain audibly.
 *  (2) a real convolver reverb for a local audio file: if the user
 *      drops/selects an MP3, THAT file is routed through the convolver,
 *      so reverb truly applies to the track.
 * An AnalyserNode taps the hall layer so the level can be measured:
 * window.__thandaTheeve.getReverbLevel() reports RMS + gains.
 */

(function () {
  'use strict';

  var TRACKS = window.MANNSIMRAT_TRACKS || [];
  if (!TRACKS.length) {
    TRACKS = [{ id: 'mann-simrat', videoId: 'KQ-wcUDV2a8',
      titleEn: 'Mann Simrat Thanda Theevan Jeeo', titleGu: 'ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ',
      artist: 'Padma Shri Arijit Singh', raag: 'Maajh', volume: 5, volName: 'Vol 5 · Evening',
      bani: 'Sri Guru Arjan Dev Ji', durationSec: 531,
      palette: { a: '#2aa7b0', d: '#1d8a96', t: '#eefafb', o1: '#a8e3e8', o2: '#f2e3b8', g: '#d9b45b' } }];
  }

  // ---------- DOM ----------
  var playBtn = document.getElementById('playBtn');
  var restartBtn = document.getElementById('restartBtn');
  var prevBtn = document.getElementById('prevBtn');
  var nextBtn = document.getElementById('nextBtn');
  var loopBtn = document.getElementById('loopBtn');
  var seek = document.getElementById('seek');
  var currentTimeEl = document.getElementById('currentTime');
  var totalTimeEl = document.getElementById('totalTime');
  var volumeSlider = document.getElementById('volume');
  var volumeValue = document.getElementById('volumeValue');
  var reverbBtn = document.getElementById('reverbBtn');
  var reverbSlider = document.getElementById('reverbIntensity');
  var reverbValue = document.getElementById('reverbValue');
  var presetSeg = document.getElementById('presetSeg');
  var reverbIndicator = document.getElementById('reverbIndicator');
  var nowPlaying = document.getElementById('nowPlaying');
  var sourceBadge = document.getElementById('sourceBadge');
  var dropZone = document.getElementById('dropZone');
  var localFile = document.getElementById('localFile');
  var localInfo = document.getElementById('localInfo');
  var localName = document.getElementById('localName');
  var backToYT = document.getElementById('backToYT');
  var showVideoBtn = document.getElementById('showVideoBtn');
  var ytWrap = document.getElementById('ytWrap');
  var eyebrow = document.getElementById('eyebrow');
  var titleGu = document.getElementById('titleGu');
  var titleEn = document.getElementById('titleEn');
  var metaLine = document.getElementById('metaLine');
  var baniLine = document.getElementById('baniLine');
  var albumArt = document.getElementById('albumArt');
  var ytLink = document.getElementById('ytLink');
  var spotifyLink = document.getElementById('spotifyLink');
  var trackSearch = document.getElementById('trackSearch');
  var volFilter = document.getElementById('volFilter');
  var trackList = document.getElementById('trackList');
  var trackCount = document.getElementById('trackCount');

  // ---------- State ----------
  var player = null;
  var ytReady = false;
  var isPlaying = false;
  var loopOn = true;          // Loop ON by default
  var volume = 80;            // 0–100
  var mode = 'youtube';       // 'youtube' | 'local'
  var duration = 0;
  var seeking = false;
  var progressTimer = null;
  var currentIndex = 0;       // index into TRACKS
  var filterVol = 'all';
  var searchQuery = '';
  var visibleTracks = TRACKS.slice();

  // Reverb state (v2)
  var reverbOn = false;
  var reverbIntensity = 50;   // 0–100
  var reverbPreset = 'hall';  // 'hall' | 'temple' | 'soft'
  var PRESETS = {
    hall:   { decay: 2.8, gain: 1.00, label: 'Hall' },
    temple: { decay: 4.6, gain: 1.25, label: 'Temple' },
    soft:   { decay: 1.7, gain: 0.60, label: 'Soft' }
  };

  // ---------- Web Audio (reverb) ----------
  var audioCtx = null;
  var convolver = null;      // shared generated impulse (preset decides decay)
  var masterGain = null;      // hall layer master (the audible level)
  var wetGain = null;         // convolver output level (intensity moves this too)
  var analyser = null;
  var analyserData = null;

  // Local-file graph
  var localAudio = null;
  var localSrcNode = null;
  var localDry = null;
  var localWet = null;

  function formatTime(s) {
    if (!isFinite(s) || s == null || s < 0) return '0:00';
    s = Math.floor(s);
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  function setRangeFill(el) {
    var min = parseFloat(el.min || 0);
    var max = parseFloat(el.max || 100);
    var pct = ((parseFloat(el.value) - min) / (max - min)) * 100;
    el.style.setProperty('--fill', pct + '%');
  }

  // Generated impulse response: stereo noise with exponential decay.
  function makeImpulse(ctx, seconds, decay) {
    var rate = ctx.sampleRate;
    var len = Math.floor(rate * seconds);
    var impulse = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var data = impulse.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return impulse;
  }

  // Raag Maajh drone: Sa (C3) – Pa (G3) – Sa' (C4), tanpura-like.
  // Maajh is a Bilawal-thaat raag (all shuddha notes), so Sa/Pa/Sa' is home.
  function startDrone(ctx, bus) {
    var notes = [
      { f: 130.81, type: 'sine', g: 0.50 },   // Sa  (C3)
      { f: 130.81, type: 'triangle', g: 0.22, detune: 4 },
      { f: 196.00, type: 'sine', g: 0.34 },   // Pa  (G3)
      { f: 196.00, type: 'triangle', g: 0.14, detune: -4 },
      { f: 261.63, type: 'sine', g: 0.16 }    // Sa' (C4)
    ];
    notes.forEach(function (n) {
      var osc = ctx.createOscillator();
      osc.type = n.type;
      osc.frequency.value = n.f;
      if (n.detune) osc.detune.value = n.detune;
      var g = ctx.createGain();
      g.gain.value = n.g;
      osc.connect(g);
      g.connect(bus);
      osc.start();
    });
    // Slow breathing LFO so the drone feels alive, not a flat tone.
    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07;
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain);
    lfoGain.connect(bus.gain);
    lfo.start();
  }

  function ensureAudio() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    var preset = PRESETS[reverbPreset];

    convolver = audioCtx.createConvolver();
    convolver.buffer = makeImpulse(audioCtx, preset.decay, 2.6);

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    wetGain = audioCtx.createGain();
    wetGain.gain.value = 0.5;
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    analyserData = new Uint8Array(analyser.fftSize);
    convolver.connect(wetGain);
    wetGain.connect(masterGain);
    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    // Drone bus: a little dry warmth + most of it into the hall.
    var droneBus = audioCtx.createGain();
    droneBus.gain.value = 0.9;
    startDrone(audioCtx, droneBus);
    var dryPad = audioCtx.createGain();
    dryPad.gain.value = 0.22;
    droneBus.connect(dryPad);
    dryPad.connect(masterGain);
    droneBus.connect(convolver);

    // Soft filtered-noise bed into the hall (air, not hiss).
    var len = audioCtx.sampleRate * 2;
    var buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.0;
    }
    var noiseSrc = audioCtx.createBufferSource();
    noiseSrc.buffer = buf;
    noiseSrc.loop = true;
    var lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 380;
    var noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.5;
    noiseSrc.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(convolver);
    noiseSrc.start();

    return audioCtx;
  }

  // v2 gains — clearly audible, not a whisper.
  // master: 0 at Off; at 50% Hall ≈ 0.14, at 100% Hall 0.25, Temple 0.31, Soft 0.15.
  function hallMasterGain() {
    if (!reverbOn) return 0;
    return PRESETS[reverbPreset].gain * (0.02 + 0.23 * (reverbIntensity / 100));
  }
  function hallWetGain() {
    return 0.35 + 0.65 * (reverbIntensity / 100);
  }

  function applyReverb() {
    if (audioCtx) {
      var t = audioCtx.currentTime;
      if (masterGain) masterGain.gain.setTargetAtTime(hallMasterGain(), t, 0.3);
      if (wetGain) wetGain.gain.setTargetAtTime(hallWetGain(), t, 0.3);
      if (localWet) {
        // Real reverb on the local file: wet level follows intensity + preset.
        var wet = (mode === 'local' && reverbOn)
          ? (0.25 + 0.55 * (reverbIntensity / 100)) * PRESETS[reverbPreset].gain
          : 0;
        localWet.gain.setTargetAtTime(wet, t, 0.1);
      }
    }
    var label = reverbOn
      ? 'Reverb: On • ' + PRESETS[reverbPreset].label + ' ' + reverbIntensity + '%'
      : 'Reverb: Off';
    reverbBtn.textContent = label;
    reverbBtn.classList.toggle('is-on', reverbOn);
    reverbBtn.setAttribute('aria-pressed', String(reverbOn));
    if (reverbIndicator) reverbIndicator.hidden = !reverbOn;
  }

  function setPreset(name) {
    if (!PRESETS[name]) return;
    reverbPreset = name;
    // New decay = new hall: rebuild the impulse.
    if (audioCtx && convolver) {
      convolver.buffer = makeImpulse(audioCtx, PRESETS[name].decay, 2.6);
    }
    var btns = presetSeg.querySelectorAll('.preset-btn');
    btns.forEach(function (b) { b.classList.toggle('is-on', b.dataset.preset === name); });
    applyReverb();
  }

  function getReverbLevel() {
    var rms = 0, peak = 0;
    if (analyser && analyserData) {
      analyser.getByteTimeDomainData(analyserData);
      var sum = 0;
      for (var i = 0; i < analyserData.length; i++) {
        var v = (analyserData[i] - 128) / 128;
        sum += v * v;
        if (Math.abs(v) > peak) peak = Math.abs(v);
      }
      rms = Math.sqrt(sum / analyserData.length);
    }
    return {
      on: reverbOn, preset: reverbPreset, intensity: reverbIntensity,
      masterGain: hallMasterGain(), wetGain: hallWetGain(),
      rms: +rms.toFixed(4), peak: +peak.toFixed(4),
      contextState: audioCtx ? audioCtx.state : 'none'
    };
  }

  // ---------- Tracks ----------
  function currentTrack() { return TRACKS[currentIndex]; }

  function thumbUrl(t, hi) {
    return 'https://i.ytimg.com/vi/' + t.videoId + '/' + (hi ? 'maxresdefault' : 'hqdefault') + '.jpg';
  }

  function applyPalette(t) {
    var p = t.palette || {};
    var root = document.documentElement.style;
    root.setProperty('--accent', p.a || '#2aa7b0');
    root.setProperty('--accent-deep', p.d || '#1d8a96');
    root.setProperty('--tint', p.t || '#eefafb');
    root.setProperty('--orb-a', p.o1 || '#a8e3e8');
    root.setProperty('--orb-b', p.o2 || '#f2e3b8');
    root.setProperty('--gold', p.g || '#d9b45b');
  }

  function setThumb(t) {
    albumArt.onerror = function () {
      albumArt.onerror = null;
      albumArt.src = thumbUrl(t, false);
    };
    albumArt.src = thumbUrl(t, true);
    albumArt.alt = t.titleEn + ' — official Sabad Naad thumbnail';
  }

  function applyTrack(index, opts) {
    opts = opts || {};
    currentIndex = ((index % TRACKS.length) + TRACKS.length) % TRACKS.length;
    var t = currentTrack();
    var wasPlaying = isPlaying;

    applyPalette(t);
    setThumb(t);
    eyebrow.textContent = 'Sabad Naad \u00a0•\u00a0 ' + t.volName + ' \u00a0•\u00a0 Raag ' + t.raag;
    if (t.titleGu) {
      titleGu.textContent = t.titleGu;
      titleGu.style.display = '';
      titleEn.textContent = t.titleEn;
    } else {
      titleGu.style.display = 'none';
      titleEn.textContent = t.titleEn;
    }
    metaLine.innerHTML = '';
    metaLine.appendChild(document.createTextNode(t.artist + ' \u00a0•\u00a0 Sabad Naad ' + t.volName + ' \u00a0•\u00a0 Raag ' + t.raag));
    metaLine.appendChild(document.createElement('br'));
    metaLine.appendChild(baniLine); // innerHTML='' detached it; put it back
    baniLine.textContent = t.bani ? ('Bani by ' + t.bani) : '';
    document.title = t.titleEn + ' — MannSimrat';
    ytLink.href = 'https://www.youtube.com/watch?v=' + t.videoId;
    spotifyLink.href = 'https://open.spotify.com/search/' +
      encodeURIComponent(t.titleEn + ' ' + t.artist);

    // Reset progress; real duration arrives from the player.
    duration = t.durationSec || 0;
    totalTimeEl.textContent = formatTime(duration);
    currentTimeEl.textContent = '0:00';
    seek.max = String(duration || 100);
    seek.value = '0';
    setRangeFill(seek);
    if (mode === 'youtube') {
      sourceBadge.textContent = 'Source: Official YouTube \u00a0•\u00a0 Loop';
      sourceBadge.classList.remove('local');
    }

    if (mode === 'youtube' && ytReady && player) {
      // loadVideoById plays automatically; cueVideoById just loads.
      if (opts.autoplay || wasPlaying) {
        player.loadVideoById({ videoId: t.videoId, startSeconds: 0 });
      } else {
        player.cueVideoById({ videoId: t.videoId, startSeconds: 0 });
      }
      try { player.setLoop(loopOn); } catch (e) {}
    }
    markActiveTrack();
  }

  function visibleList() { return visibleTracks.length ? visibleTracks : TRACKS; }

  function stepTrack(dir) {
    var list = visibleList();
    var pos = list.indexOf(currentTrack());
    if (pos === -1) { applyTrack(currentIndex + dir, { autoplay: isPlaying }); return; }
    var next = list[(pos + dir + list.length) % list.length];
    applyTrack(TRACKS.indexOf(next), { autoplay: isPlaying });
  }

  // ---------- Track picker ----------
  function renderTrackList() {
    var q = searchQuery.trim().toLowerCase();
    visibleTracks = TRACKS.filter(function (t) {
      if (filterVol !== 'all' && t.volume !== parseInt(filterVol, 10)) return false;
      if (!q) return true;
      return (t.titleEn + ' ' + t.artist + ' ' + t.raag + ' ' + t.volName).toLowerCase().indexOf(q) !== -1;
    });
    trackCount.textContent = visibleTracks.length + (visibleTracks.length === 1 ? ' track' : ' tracks') +
      (filterVol !== 'all' || q ? ' · ' + TRACKS.length + ' total' : '');
    trackList.innerHTML = '';
    if (!visibleTracks.length) {
      var li = document.createElement('li');
      li.className = 'track-empty';
      li.textContent = 'No tracks match — try a different search or volume.';
      trackList.appendChild(li);
      return;
    }
    visibleTracks.forEach(function (t) {
      var item = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'track-item' + (TRACKS.indexOf(t) === currentIndex ? ' is-active' : '');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', String(TRACKS.indexOf(t) === currentIndex));
      btn.dataset.trackId = t.id;

      var img = document.createElement('img');
      img.className = 'track-thumb';
      img.alt = '';
      img.loading = 'lazy';
      img.src = 'https://i.ytimg.com/vi/' + t.videoId + '/mqdefault.jpg';
      img.onerror = function () { img.style.visibility = 'hidden'; };

      var meta = document.createElement('span');
      meta.className = 'track-meta';
      var title = document.createElement('span');
      title.className = 'track-title';
      title.textContent = (TRACKS.indexOf(t) === currentIndex && isPlaying ? '▶ ' : '') + t.titleEn;
      var sub = document.createElement('span');
      sub.className = 'track-sub';
      sub.textContent = t.artist + ' • Raag ' + t.raag;
      meta.appendChild(title);
      meta.appendChild(sub);

      var vol = document.createElement('span');
      vol.className = 'track-vol';
      vol.textContent = 'Vol ' + t.volume;

      btn.appendChild(img);
      btn.appendChild(meta);
      btn.appendChild(vol);
      btn.addEventListener('click', function () {
        if (mode === 'local') backToYouTube();
        // Play the picked track only if something was already playing;
        // otherwise just load it, cued and ready (brief: "start playing
        // if Play was on").
        applyTrack(TRACKS.indexOf(t), { autoplay: isPlaying });
      });
      item.appendChild(btn);
      trackList.appendChild(item);
    });
  }

  function markActiveTrack() {
    var items = trackList.querySelectorAll('.track-item');
    items.forEach(function (btn) {
      var active = btn.dataset.trackId === currentTrack().id;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
  }

  // ---------- YouTube IFrame API ----------
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('player', {
      videoId: currentTrack().videoId,
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: currentTrack().videoId,
        rel: 0,
        modestbranding: 1,
        playsinline: 1,
        iv_load_policy: 3
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: onPlayerError
      }
    });
  };

  function onPlayerReady() {
    ytReady = true;
    player.setVolume(volume);
    try { player.setLoop(loopOn); } catch (e) {}
    duration = player.getDuration() || currentTrack().durationSec || 0;
    totalTimeEl.textContent = formatTime(duration);
    startProgressTimer();
  }

  function onPlayerStateChange(e) {
    if (mode !== 'youtube') return;
    if (e.data === YT.PlayerState.PLAYING) {
      setPlaying(true);
      duration = player.getDuration() || duration;
      totalTimeEl.textContent = formatTime(duration);
    } else if (e.data === YT.PlayerState.PAUSED) {
      setPlaying(false);
    } else if (e.data === YT.PlayerState.ENDED) {
      if (loopOn) {
        player.seekTo(0, true);
        player.playVideo();
      } else {
        setPlaying(false);
      }
    } else if (e.data === YT.PlayerState.CUED) {
      duration = player.getDuration() || duration;
      totalTimeEl.textContent = formatTime(duration);
      try { player.setLoop(loopOn); } catch (err) {}
    }
  }

  function onPlayerError(e) {
    sourceBadge.textContent = 'YouTube player had a problem — open the official video via the link below';
    setPlaying(false);
    console.warn('YouTube player error', e && e.data);
  }

  window.addEventListener('load', function () {
    setTimeout(function () {
      if (!ytReady && mode === 'youtube' && !window.YT) {
        sourceBadge.textContent = 'YouTube could not load here — check connection, or open the official video below';
      }
    }, 8000);
  });

  // ---------- Playback controls ----------
  function setPlaying(playing) {
    isPlaying = playing;
    playBtn.innerHTML = playing ? '⏸&nbsp; Pause' : '▶&nbsp; Play';
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    if (nowPlaying) nowPlaying.hidden = !playing;
    markActiveTrack();
  }

  function play() {
    ensureAudio(); // user gesture: safe moment to create/resume AudioContext (TV browsers too)
    if (mode === 'local') {
      if (localAudio) {
        localAudio.play().catch(function (err) { console.warn('Local playback failed', err); });
        setPlaying(true);
      }
      return;
    }
    if (ytReady && player && player.playVideo) {
      player.playVideo();
      setPlaying(true);
    }
  }

  function pause() {
    if (mode === 'local') {
      if (localAudio) localAudio.pause();
      setPlaying(false);
      return;
    }
    if (ytReady && player && player.pauseVideo) player.pauseVideo();
    setPlaying(false);
  }

  function togglePlay() { if (isPlaying) pause(); else play(); }

  function restart() {
    if (mode === 'local') {
      if (localAudio) {
        localAudio.currentTime = 0;
        localAudio.play().catch(function () {});
        setPlaying(true);
      }
      return;
    }
    if (ytReady && player) {
      player.seekTo(0, true);
      player.playVideo();
      setPlaying(true);
    }
  }

  function setLoop(on) {
    loopOn = on;
    loopBtn.textContent = '⟳\u00a0 Loop: ' + (on ? 'On' : 'Off');
    loopBtn.classList.toggle('is-on', on);
    loopBtn.setAttribute('aria-pressed', String(on));
    if (ytReady && player && player.setLoop) {
      try { player.setLoop(on); } catch (e) {}
    }
    if (localAudio) localAudio.loop = on;
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(100, Math.round(v)));
    volumeSlider.value = String(volume);
    volumeValue.textContent = volume + '%';
    setRangeFill(volumeSlider);
    if (ytReady && player && player.setVolume) player.setVolume(volume);
    if (localAudio) localAudio.volume = volume / 100;
  }

  // ---------- Progress ----------
  function startProgressTimer() {
    if (progressTimer) return;
    progressTimer = setInterval(tickProgress, 250);
  }

  function tickProgress() {
    if (seeking) return;
    var cur = 0, dur = duration;
    if (mode === 'local') {
      if (!localAudio) return;
      cur = localAudio.currentTime || 0;
      dur = localAudio.duration || 0;
      duration = dur;
    } else {
      if (!ytReady || !player || !player.getCurrentTime) return;
      cur = player.getCurrentTime() || 0;
      dur = player.getDuration() || 0;
      duration = dur;
    }
    if (dur > 0) {
      seek.max = String(dur);
      seek.value = String(cur);
      setRangeFill(seek);
      totalTimeEl.textContent = formatTime(dur);
    }
    currentTimeEl.textContent = formatTime(cur);
  }

  seek.addEventListener('input', function () {
    seeking = true;
    currentTimeEl.textContent = formatTime(parseFloat(seek.value) || 0);
    setRangeFill(seek);
  });
  seek.addEventListener('change', function () {
    var t = parseFloat(seek.value) || 0;
    seeking = false;
    if (mode === 'local') {
      if (localAudio) localAudio.currentTime = t;
    } else if (ytReady && player) {
      player.seekTo(t, true);
    }
    tickProgress();
  });

  // ---------- Buttons / sliders ----------
  playBtn.addEventListener('click', function () { togglePlay(); });
  restartBtn.addEventListener('click', restart);
  prevBtn.addEventListener('click', function () { stepTrack(-1); });
  nextBtn.addEventListener('click', function () { stepTrack(1); });
  loopBtn.addEventListener('click', function () { setLoop(!loopOn); });

  volumeSlider.addEventListener('input', function () {
    setVolume(parseFloat(volumeSlider.value));
  });

  reverbBtn.addEventListener('click', function () {
    ensureAudio(); // tap = gesture: create/resume context here too
    reverbOn = !reverbOn;
    applyReverb();
  });
  reverbSlider.addEventListener('input', function () {
    reverbIntensity = parseInt(reverbSlider.value, 10) || 0;
    reverbValue.textContent = reverbIntensity + '%';
    setRangeFill(reverbSlider);
    if (reverbOn) applyReverb();
  });
  presetSeg.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.preset-btn') : null;
    if (!btn) return;
    ensureAudio();
    setPreset(btn.dataset.preset);
  });

  showVideoBtn.addEventListener('click', function () {
    var show = !ytWrap.classList.contains('show');
    ytWrap.classList.toggle('show', show);
    showVideoBtn.textContent = show ? 'Hide video' : 'Show video';
    showVideoBtn.setAttribute('aria-expanded', String(show));
  });

  // ---------- Picker events ----------
  trackSearch.addEventListener('input', function () {
    searchQuery = trackSearch.value || '';
    renderTrackList();
  });
  volFilter.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('.vol-btn') : null;
    if (!btn) return;
    filterVol = btn.dataset.vol;
    volFilter.querySelectorAll('.vol-btn').forEach(function (b) {
      b.classList.toggle('is-on', b === btn);
    });
    renderTrackList();
  });

  // ---------- Keyboard: Space, L, R, N, P ----------
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' && e.target.type !== 'range') return;
    if (tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.code === 'Space' || e.key === ' ') {
      if (tag === 'BUTTON') return;
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'l' || e.key === 'L') {
      setLoop(!loopOn);
    } else if (e.key === 'r' || e.key === 'R') {
      ensureAudio();
      reverbOn = !reverbOn;
      applyReverb();
    } else if (e.key === 'n' || e.key === 'N') {
      stepTrack(1);
    } else if (e.key === 'p' || e.key === 'P') {
      stepTrack(-1);
    }
  });

  // ---------- Local file — real convolver reverb ----------
  function loadLocalFile(file) {
    if (!file) return;
    ensureAudio();
    if (!audioCtx) {
      alert('Web Audio is not available in this browser, so local-file reverb cannot run.');
      return;
    }
    if (ytReady && player && player.pauseVideo) player.pauseVideo();
    setPlaying(false);

    if (localAudio) {
      localAudio.pause();
      try { localAudio.src = ''; } catch (e) {}
    } else {
      localAudio = new Audio();
      localAudio.preload = 'auto';
      localAudio.addEventListener('ended', function () {
        if (!loopOn) setPlaying(false);
      });
      localAudio.addEventListener('play', function () { setPlaying(true); });
      localAudio.addEventListener('pause', function () { setPlaying(false); });
    }

    if (!localSrcNode) {
      localSrcNode = audioCtx.createMediaElementSource(localAudio);
      localDry = audioCtx.createGain();
      localWet = audioCtx.createGain();
      localDry.gain.value = 1;
      localWet.gain.value = 0;
      localSrcNode.connect(localDry);
      localDry.connect(audioCtx.destination);
      localSrcNode.connect(convolver);
      convolver.connect(localWet);
      localWet.connect(audioCtx.destination);
    }

    localAudio.src = URL.createObjectURL(file);
    localAudio.loop = loopOn;
    localAudio.volume = volume / 100;
    localAudio.load();
    mode = 'local';
    localName.textContent = '♪ ' + file.name + ' — local file (real reverb applies)';
    localInfo.hidden = false;
    sourceBadge.textContent = 'Source: Your local file • Real reverb';
    sourceBadge.classList.add('local');
    applyReverb();
    localAudio.play().then(function () { setPlaying(true); })
      .catch(function (err) { console.warn('Local playback failed', err); });
    startProgressTimer();
  }

  function backToYouTube() {
    if (localAudio) localAudio.pause();
    mode = 'youtube';
    localInfo.hidden = true;
    sourceBadge.textContent = 'Source: Official YouTube • Loop';
    sourceBadge.classList.remove('local');
    applyReverb();
    setPlaying(false);
    duration = (ytReady && player) ? (player.getDuration() || 0) : (currentTrack().durationSec || 0);
    totalTimeEl.textContent = formatTime(duration);
    currentTimeEl.textContent = '0:00';
    seek.value = '0';
    setRangeFill(seek);
  }

  localFile.addEventListener('change', function () {
    if (localFile.files && localFile.files[0]) loadLocalFile(localFile.files[0]);
    localFile.value = '';
  });
  backToYT.addEventListener('click', backToYouTube);

  ['dragenter', 'dragover'].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
    });
  });
  dropZone.addEventListener('drop', function (e) {
    var files = e.dataTransfer && e.dataTransfer.files;
    if (files && files[0]) loadLocalFile(files[0]);
  });

  // ---------- Init ----------
  renderTrackList();
  applyTrack(0, { autoplay: false });
  setLoop(true);
  setVolume(80);
  setRangeFill(seek);
  setRangeFill(volumeSlider);
  setRangeFill(reverbSlider);
  reverbValue.textContent = reverbIntensity + '%';
  applyReverb();
  startProgressTimer();
  // Play focused on load (remote: Space/Enter starts it right away).
  try { playBtn.focus({ preventScroll: true }); } catch (e) { playBtn.focus(); }

  window.__thandaTheeve = {
    videoId: currentTrack().videoId,
    url: 'https://www.youtube.com/watch?v=' + currentTrack().videoId,
    trackCount: TRACKS.length,
    tracks: TRACKS.map(function (t) { return { id: t.id, videoId: t.videoId, title: t.titleEn, volume: t.volume }; }),
    getTrack: function () { return currentTrack(); },
    getMode: function () { return mode; },
    isLoopOn: function () { return loopOn; },
    isReverbOn: function () { return reverbOn; },
    getReverbLevel: getReverbLevel,
    getReverbGains: function () { return { master: hallMasterGain(), wet: hallWetGain(), preset: reverbPreset, intensity: reverbIntensity }; }
  };
})();
