/* MannSimrat — v3 (full redesign)
 *
 * One track only: "Mann Simrat Thanda Theevan Jeeo" — ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ
 * by Padma Shri Arijit Singh, Sabad Naad Vol 5, Raag Maajh.
 * Official YouTube video ID: KQ-wcUDV2a8. No audio is copied, downloaded
 * or hosted here — playback streams from the official Sabad Naad embed.
 *
 * Two options only: Loop (top pill) and Play (big circle). No library,
 * no extra text. The screen stays alive with a slow gradient and
 * drifting orbs (CSS). (Petals were removed on Manmohan's word, 2026-11-25.)
 *
 * Your own file (approved by Manmohan, 2026-11-25): one small "Apni file"
 * pill under Play. Pick an audio file from your own device and it plays
 * locally through a REAL convolver reverb (MediaElementSource -> dry +
 * wet gains) — the only place reverb exists, and only in file mode.
 * The file never leaves the device: no upload, no hosting, no storage.
 * YouTube mode has no reverb control at all — YouTube iframe audio is
 * cross-origin and cannot be processed, and this site stays honest.
 */

(function () {
  'use strict';

  var VIDEO_ID = 'KQ-wcUDV2a8';
  var DURATION_FALLBACK = 531; // 8:51

  // ---------- DOM ----------
  var playBtn = document.getElementById('playBtn');
  var loopBtn = document.getElementById('loopBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressFill = document.getElementById('progressFill');
  var fileBtn = document.getElementById('fileBtn');
  var localFile = document.getElementById('localFile');
  var localAudio = document.getElementById('localAudio');
  var fileUi = document.getElementById('fileUi');
  var fileReverbBtn = document.getElementById('fileReverbBtn');
  var fileReverbIntensity = document.getElementById('fileReverbIntensity');

  // ---------- State ----------
  var player = null;
  var ytReady = false;
  var isPlaying = false;
  var loopOn = true; // Loop ON by default
  var duration = DURATION_FALLBACK;
  var progressTimer = null;

  // File mode state
  var mode = 'youtube'; // 'youtube' | 'local'
  var fileReverbOn = true;
  var fileIntensity = 50; // 0-100
  var audioCtx = null;
  var fileSrcNode = null;
  var fileDry = null;
  var fileWet = null;
  var wetAnalyser = null;
  var wetAnalyserData = null;
  var objectUrl = null;

  // ---------- YouTube IFrame API ----------
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player('player', {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: VIDEO_ID,
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
    try { player.setVolume(80); } catch (e) {}
    try { player.setLoop(loopOn); } catch (e) {}
    duration = player.getDuration() || DURATION_FALLBACK;
    startProgressTimer();
  }

  function onPlayerStateChange(e) {
    if (mode !== 'youtube') return;
    if (e.data === YT.PlayerState.PLAYING) {
      setPlaying(true);
      duration = player.getDuration() || duration;
    } else if (e.data === YT.PlayerState.PAUSED) {
      setPlaying(false);
    } else if (e.data === YT.PlayerState.ENDED) {
      if (loopOn) {
        player.seekTo(0, true);
        player.playVideo();
      } else {
        setPlaying(false);
      }
    }
  }

  function onPlayerError(e) {
    setPlaying(false);
    console.warn('YouTube player error', e && e.data);
  }

  // ---------- Playback ----------
  function setPlaying(playing) {
    isPlaying = playing;
    playBtn.textContent = playing ? '⏸' : '▶';
    playBtn.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }

  function play() {
    if (mode === 'local') {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      localAudio.play().catch(function (err) { console.warn('Local playback failed', err); });
      return;
    }
    if (ytReady && player && player.playVideo) {
      player.playVideo();
      setPlaying(true);
    }
  }

  function pause() {
    if (mode === 'local') {
      localAudio.pause();
      return;
    }
    if (ytReady && player && player.pauseVideo) player.pauseVideo();
    setPlaying(false);
  }

  function togglePlay() { if (isPlaying) pause(); else play(); }

  function setLoop(on) {
    loopOn = on;
    loopBtn.innerHTML = '⟳&nbsp; Loop: ' + (on ? 'On' : 'Off');
    loopBtn.classList.toggle('is-on', on);
    loopBtn.setAttribute('aria-pressed', String(on));
    if (ytReady && player && player.setLoop) {
      try { player.setLoop(on); } catch (e) {}
    }
    if (localAudio) localAudio.loop = on;
  }

  // ---------- Progress (thin line, no numbers) ----------
  function startProgressTimer() {
    if (progressTimer) return;
    progressTimer = setInterval(tickProgress, 250);
  }

  function tickProgress() {
    var cur = 0, dur = 0;
    if (mode === 'local') {
      cur = localAudio.currentTime || 0;
      dur = localAudio.duration || 0;
    } else {
      if (!ytReady || !player || !player.getCurrentTime) return;
      cur = player.getCurrentTime() || 0;
      dur = player.getDuration() || duration || 0;
    }
    if (dur > 0) {
      duration = dur;
      var pct = Math.max(0, Math.min(100, (cur / dur) * 100));
      progressFill.style.width = pct + '%';
      progressWrap.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
  }

  function seekFromEvent(e) {
    var rect = progressWrap.getBoundingClientRect();
    var x = (e.clientX != null ? e.clientX : rect.left + rect.width / 2) - rect.left;
    var ratio = Math.max(0, Math.min(1, x / rect.width));
    if (mode === 'local') {
      var ldur = localAudio.duration || 0;
      if (ldur > 0) localAudio.currentTime = ratio * ldur;
    } else {
      if (!ytReady || !player || !player.seekTo) return;
      var dur = player.getDuration() || duration || 0;
      if (dur > 0) player.seekTo(ratio * dur, true);
    }
    tickProgress();
  }

  progressWrap.addEventListener('click', seekFromEvent);
  progressWrap.addEventListener('keydown', function (e) {
    var cur, dur;
    if (mode === 'local') {
      cur = localAudio.currentTime || 0;
      dur = localAudio.duration || 0;
      if (e.key === 'ArrowRight') { localAudio.currentTime = Math.min(dur, cur + 10); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { localAudio.currentTime = Math.max(0, cur - 10); e.preventDefault(); }
      return;
    }
    if (!ytReady || !player) return;
    cur = player.getCurrentTime() || 0;
    if (e.key === 'ArrowRight') { player.seekTo(Math.min(duration, cur + 10), true); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { player.seekTo(Math.max(0, cur - 10), true); e.preventDefault(); }
  });

  // ---------- Buttons ----------
  playBtn.addEventListener('click', togglePlay);
  loopBtn.addEventListener('click', function () { setLoop(!loopOn); });

  // ---------- Keyboard: Space = play/pause, L = loop ----------
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.code === 'Space' || e.key === ' ') {
      if (tag === 'BUTTON') return; // focused button handles Space itself
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'l' || e.key === 'L') {
      setLoop(!loopOn);
    }
  });

  // ---------- Your own file: real convolver reverb (file mode only) ----------
  function makeImpulse(ctx, seconds, decayPow) {
    var rate = ctx.sampleRate;
    var len = Math.floor(rate * seconds);
    var impulse = ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var data = impulse.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decayPow);
      }
    }
    return impulse;
  }

  // Wet level follows the v2 fix levels: clearly audible, not a whisper.
  function fileWetLevel() {
    return fileReverbOn ? (0.25 + 0.55 * (fileIntensity / 100)) : 0;
  }

  function ensureFileAudio() {
    if (audioCtx) {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return true;
    }
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    audioCtx = new AC();

    var convolver = audioCtx.createConvolver();
    convolver.buffer = makeImpulse(audioCtx, 2.8, 2.6); // Hall-length tail

    fileDry = audioCtx.createGain();
    fileDry.gain.value = 1;
    fileWet = audioCtx.createGain();
    fileWet.gain.value = fileWetLevel();
    wetAnalyser = audioCtx.createAnalyser();
    wetAnalyser.fftSize = 2048;
    wetAnalyserData = new Uint8Array(wetAnalyser.fftSize);

    fileSrcNode = audioCtx.createMediaElementSource(localAudio);
    fileSrcNode.connect(fileDry);
    fileDry.connect(audioCtx.destination);
    fileSrcNode.connect(convolver);
    convolver.connect(fileWet);
    fileWet.connect(wetAnalyser);
    wetAnalyser.connect(audioCtx.destination);
    return true;
  }

  function applyFileReverb() {
    if (audioCtx && fileWet) {
      fileWet.gain.setTargetAtTime(fileWetLevel(), audioCtx.currentTime, 0.1);
    }
    fileReverbBtn.textContent = 'Reverb: ' + (fileReverbOn ? 'On' : 'Off');
    fileReverbBtn.classList.toggle('is-on', fileReverbOn);
    fileReverbBtn.setAttribute('aria-pressed', String(fileReverbOn));
    var pct = fileIntensity + '%';
    fileReverbIntensity.style.setProperty('--fill', pct);
  }

  function loadLocalFile(file) {
    if (!file) return;
    if (!ensureFileAudio()) {
      console.warn('Web Audio is not available in this browser.');
      return;
    }
    if (ytReady && player && player.pauseVideo) player.pauseVideo();
    setPlaying(false);

    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    localAudio.src = objectUrl;
    localAudio.loop = loopOn;
    mode = 'local';
    fileUi.classList.add('show');
    fileBtn.innerHTML = '▶&nbsp; YouTube';
    applyFileReverb();
    progressFill.style.width = '0%';
    localAudio.play().catch(function (err) { console.warn('Local playback failed', err); });
  }

  function backToYouTube() {
    localAudio.pause();
    mode = 'youtube';
    fileUi.classList.remove('show');
    fileBtn.innerHTML = '♪&nbsp; Apni file';
    setPlaying(false);
    duration = (ytReady && player && player.getDuration) ? (player.getDuration() || DURATION_FALLBACK) : DURATION_FALLBACK;
    progressFill.style.width = '0%';
  }

  fileBtn.addEventListener('click', function () {
    if (mode === 'local') backToYouTube();
    else localFile.click();
  });
  localFile.addEventListener('change', function () {
    if (localFile.files && localFile.files[0]) loadLocalFile(localFile.files[0]);
    localFile.value = '';
  });
  fileReverbBtn.addEventListener('click', function () {
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    fileReverbOn = !fileReverbOn;
    applyFileReverb();
  });
  fileReverbIntensity.addEventListener('input', function () {
    fileIntensity = parseInt(fileReverbIntensity.value, 10) || 0;
    applyFileReverb();
  });
  localAudio.addEventListener('play', function () { if (mode === 'local') setPlaying(true); });
  localAudio.addEventListener('pause', function () { if (mode === 'local') setPlaying(false); });
  localAudio.addEventListener('ended', function () { if (!loopOn) setPlaying(false); });

  function getLocalReverb() {
    var rms = 0;
    if (wetAnalyser && wetAnalyserData) {
      wetAnalyser.getByteTimeDomainData(wetAnalyserData);
      var sum = 0;
      for (var i = 0; i < wetAnalyserData.length; i++) {
        var v = (wetAnalyserData[i] - 128) / 128;
        sum += v * v;
      }
      rms = Math.sqrt(sum / wetAnalyserData.length);
    }
    return {
      mode: mode,
      on: fileReverbOn,
      intensity: fileIntensity,
      wet: fileWet ? +fileWet.gain.value.toFixed(3) : fileWetLevel(),
      wetTarget: +fileWetLevel().toFixed(3),
      wetRms: +rms.toFixed(4),
      contextState: audioCtx ? audioCtx.state : 'none'
    };
  }

  // ---------- Init ----------
  setLoop(true);
  startProgressTimer();
  // Play focused on load (remote: Space/Enter starts it right away).
  try { playBtn.focus({ preventScroll: true }); } catch (e) { playBtn.focus(); }

  window.__mannSimrat = {
    videoId: VIDEO_ID,
    url: 'https://www.youtube.com/watch?v=' + VIDEO_ID,
    isPlaying: function () { return isPlaying; },
    isLoopOn: function () { return loopOn; },
    getMode: function () { return mode; },
    getLocalReverb: getLocalReverb,
    getProgress: function () {
      if (mode === 'local') return { cur: localAudio.currentTime || 0, dur: localAudio.duration || 0 };
      var cur = (ytReady && player && player.getCurrentTime) ? player.getCurrentTime() : 0;
      return { cur: cur, dur: duration };
    }
  };
})();
