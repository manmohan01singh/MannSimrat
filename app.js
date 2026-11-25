/* MannSimrat — v3 (full redesign)
 *
 * One track only: "Mann Simrat Thanda Theevan Jeeo" — ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ
 * by Padma Shri Arijit Singh, Sabad Naad Vol 5, Raag Maajh.
 * Official YouTube video ID: KQ-wcUDV2a8. No audio is copied, downloaded
 * or hosted here — playback streams from the official Sabad Naad embed.
 *
 * Two options only: Loop (top pill) and Play (big circle). No library,
 * no reverb, no extra text. The screen stays alive with a slow gradient,
 * drifting orbs (CSS) and real petals (canvas-drawn petal shapes).
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
  var petalCanvas = document.getElementById('petals');

  // ---------- State ----------
  var player = null;
  var ytReady = false;
  var isPlaying = false;
  var loopOn = true; // Loop ON by default
  var duration = DURATION_FALLBACK;
  var progressTimer = null;

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
    if (ytReady && player && player.playVideo) {
      player.playVideo();
      setPlaying(true);
    }
  }

  function pause() {
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
  }

  // ---------- Progress (thin line, no numbers) ----------
  function startProgressTimer() {
    if (progressTimer) return;
    progressTimer = setInterval(tickProgress, 250);
  }

  function tickProgress() {
    if (!ytReady || !player || !player.getCurrentTime) return;
    var cur = player.getCurrentTime() || 0;
    var dur = player.getDuration() || duration || 0;
    if (dur > 0) {
      duration = dur;
      var pct = Math.max(0, Math.min(100, (cur / dur) * 100));
      progressFill.style.width = pct + '%';
      progressWrap.setAttribute('aria-valuenow', String(Math.round(pct)));
    }
  }

  function seekFromEvent(e) {
    if (!ytReady || !player || !player.seekTo) return;
    var rect = progressWrap.getBoundingClientRect();
    var x = (e.clientX != null ? e.clientX : rect.left + rect.width / 2) - rect.left;
    var ratio = Math.max(0, Math.min(1, x / rect.width));
    var dur = player.getDuration() || duration || 0;
    if (dur > 0) player.seekTo(ratio * dur, true);
    tickProgress();
  }

  progressWrap.addEventListener('click', seekFromEvent);
  progressWrap.addEventListener('keydown', function (e) {
    if (!ytReady || !player) return;
    var cur = player.getCurrentTime() || 0;
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

  // ---------- Real petals (canvas): petal shapes, slow fall + sway ----------
  var petals = [];
  var petalCtx = null;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PETAL_COLORS = [
    'rgba(255, 255, 255, 0.85)',
    'rgba(255, 214, 224, 0.75)',
    'rgba(242, 227, 184, 0.75)',
    'rgba(255, 255, 255, 0.55)',
    'rgba(255, 183, 197, 0.6)'
  ];

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    petalCanvas.width = Math.floor(window.innerWidth * dpr);
    petalCanvas.height = Math.floor(window.innerHeight * dpr);
    petalCanvas.style.width = window.innerWidth + 'px';
    petalCanvas.style.height = window.innerHeight + 'px';
    if (petalCtx) petalCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function newPetal(anywhere) {
    var w = window.innerWidth, h = window.innerHeight;
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : -30 - Math.random() * 60,
      size: 9 + Math.random() * 11,
      fall: 0.25 + Math.random() * 0.45,
      swayAmp: 18 + Math.random() * 26,
      swaySpeed: 0.0004 + Math.random() * 0.0006,
      phase: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.0006,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      alpha: 0.5 + Math.random() * 0.4
    };
  }

  function drawPetal(ctx, p) {
    var s = p.size;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.bezierCurveTo(s * 0.95, -s * 0.35, s * 0.9, s * 0.55, 0, s);
    ctx.bezierCurveTo(-s * 0.9, s * 0.55, -s * 0.95, -s * 0.35, 0, -s);
    ctx.fill();
    ctx.restore();
  }

  function startPetals() {
    if (!petalCanvas || !petalCanvas.getContext) return;
    petalCtx = petalCanvas.getContext('2d');
    sizeCanvas();
    for (var i = 0; i < 22; i++) petals.push(newPetal(true));
    if (reduceMotion) {
      petals.forEach(function (p) { drawPetal(petalCtx, p); });
      return;
    }
    var last = 0;
    function frame(now) {
      var dt = Math.min(50, now - last);
      last = now;
      var w = window.innerWidth, h = window.innerHeight;
      petalCtx.clearRect(0, 0, w, h);
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.y += p.fall * dt;
        p.x += Math.sin(now * p.swaySpeed + p.phase) * 0.35;
        p.rot += p.rotSpeed * dt;
        if (p.y > h + 40) { petals[i] = newPetal(false); continue; }
        if (p.x < -40) p.x = w + 30;
        if (p.x > w + 40) p.x = -30;
        drawPetal(petalCtx, p);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', sizeCanvas);

  // ---------- Init ----------
  setLoop(true);
  startProgressTimer();
  startPetals();
  // Play focused on load (remote: Space/Enter starts it right away).
  try { playBtn.focus({ preventScroll: true }); } catch (e) { playBtn.focus(); }

  window.__mannSimrat = {
    videoId: VIDEO_ID,
    url: 'https://www.youtube.com/watch?v=' + VIDEO_ID,
    isPlaying: function () { return isPlaying; },
    isLoopOn: function () { return loopOn; },
    petalCount: function () { return petals.length; },
    getProgress: function () {
      var cur = (ytReady && player && player.getCurrentTime) ? player.getCurrentTime() : 0;
      return { cur: cur, dur: duration };
    }
  };
})();
