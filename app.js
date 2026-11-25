/* MannSimrat — v3 (full redesign)
 *
 * One track only: "Mann Simrat Thanda Theevan Jeeo" — ਮਨ ਸਿਮਰਤ ਠੰਢਾ ਥੀਵੈ ਜੀਉ
 * by Padma Shri Arijit Singh, Sabad Naad Vol 5, Raag Maajh.
 * Official YouTube video ID: KQ-wcUDV2a8. No audio is copied, downloaded
 * or hosted here — playback streams from the official Sabad Naad embed.
 *
 * Two options only: Loop (top pill) and Play (big circle). No library,
 * no reverb, no extra text. The screen stays alive with a slow gradient,
 * drifting orbs (CSS). (Petals were removed on Manmohan's word, 2026-11-25.)
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
    getProgress: function () {
      var cur = (ytReady && player && player.getCurrentTime) ? player.getCurrentTime() : 0;
      return { cur: cur, dur: duration };
    }
  };
})();
