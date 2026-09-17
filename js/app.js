/**
 * app.js — точка входа: собирает профиль и запускает все модули.
 */
(function () {
  var profile = window.PROFILE || {};
  var statRefs = { values: {}, nodes: {} };
  var enterEl = null;

  function findStat(id) {
    var list = profile.stats || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }

  function lockScroll(locked) {
    document.body.style.overflow = locked ? "hidden" : "";
  }

  function revealStats() {
    var viewsStat = findStat("views");

    if (statRefs.values.views) {
      var total = window.Counters.registerView(
        viewsStat && typeof viewsStat.value === "number" ? viewsStat.value : 0
      );
      window.Counters.animateNumber(statRefs.values.views, Math.max(0, total - 1), total, 900);
    }

    if (statRefs.values.uptime) {
      window.Counters.startUptime(statRefs.values.uptime);
    }

    if (statRefs.values.utc) {
      window.Counters.startClock(statRefs.values.utc, profile.timeZone || "Europe/Moscow");
    }
  }

  function startTypewriter() {
    var target = document.getElementById("typewriter");
    if (!target) return;
    window.Typewriter.create(target, profile.taglines || [], { delay: 600 }).start();
  }

  function startPlayer() {
    var music = profile.music || {};
    window.Player.create({
      root: document.getElementById("player"),
      button: document.getElementById("player-toggle"),
      titleEl: document.getElementById("track-title"),
      artistEl: document.getElementById("track-artist"),
      src: music.src,
      title: music.title,
      artist: music.artist,
      enabled: music.enabled !== false
    }).init();
  }

  function boot() {
    statRefs = window.Render.fill(profile) || statRefs;

    window.Background.init(document.getElementById("bg-canvas"), profile.background);
    window.Interactions.init({ statRefs: statRefs });
    revealStats();

    enterEl = document.getElementById("enter-screen");
    var needsEnter = profile.enterScreen === true && enterEl;

    if (!needsEnter) {
      if (enterEl) enterEl.hidden = true;
      startTypewriter();
      startPlayer();
      window.Render.markReady();
      return;
    }

    enterEl.hidden = false;
    lockScroll(true);

    var button = document.getElementById("enter-btn");

    function leave() {
      enterEl.classList.add("is-leaving");
      window.setTimeout(function () {
        enterEl.hidden = true;
      }, 520);
      lockScroll(false);
      startTypewriter();
      startPlayer();
      window.Render.markReady();
    }

    if (button) button.addEventListener("click", leave, { once: true });
    enterEl.addEventListener("click", function (event) {
      if (event.target === enterEl) leave();
    });
    document.addEventListener(
      "keydown",
      function (event) {
        if (event.key === "Enter" && !enterEl.hidden) leave();
      },
      { once: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
