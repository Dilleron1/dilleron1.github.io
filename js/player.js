/**
 * player.js — фоновый трек с плавным появлением звука.
 * Если файла нет, плеер тихо помечается как пустой и не мешает странице.
 */
window.Player = (function () {
  var VOLUME = 0.45;
  var FADE_STEPS = 14;
  var STORAGE_KEY = "bio:player";

  function create(options) {
    var opts = options || {};
    var root = opts.root;
    var button = opts.button;
    var titleEl = opts.titleEl;
    var artistEl = opts.artistEl;
    var source = opts.src;
    var onChange = typeof opts.onChange === "function" ? opts.onChange : null;

    var audio = null;
    var fadeTimer = null;
    var available = Boolean(source);
    var playing = false;

    function persist(value) {
      try {
        window.localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
      } catch (error) {
        /* приватный режим — просто игнорируем */
      }
    }

    function wanted() {
      try {
        return window.localStorage.getItem(STORAGE_KEY) !== "off";
      } catch (error) {
        return true;
      }
    }

    function emit() {
      if (onChange) onChange({ playing: playing, available: available });
    }

    function syncUi() {
      if (root) {
        root.classList.toggle("is-playing", playing);
        root.classList.toggle("is-empty", !available);
      }
      if (button) {
        button.setAttribute("aria-pressed", playing ? "true" : "false");
        button.setAttribute(
          "aria-label",
          playing ? "Выключить музыку" : "Включить музыку"
        );
      }
      if (titleEl) titleEl.textContent = available ? opts.title || "—" : "трек не добавлен";
      if (artistEl) artistEl.textContent = available ? opts.artist || "—" : "assets/track.mp3";
      emit();
    }

    function clearFade() {
      window.clearInterval(fadeTimer);
      fadeTimer = null;
    }

    function fadeTo(target, onDone) {
      clearFade();
      if (!audio) return;
      var step = (target - audio.volume) / FADE_STEPS;
      var done = 0;
      fadeTimer = window.setInterval(function () {
        done += 1;
        var next = audio.volume + step;
        audio.volume = Math.min(1, Math.max(0, next));
        if (done >= FADE_STEPS) {
          clearFade();
          audio.volume = Math.min(1, Math.max(0, target));
          if (onDone) onDone();
        }
      }, 40);
    }

    function ensureAudio() {
      if (audio) return audio;
      audio = new Audio();
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0;
      audio.src = source;

      audio.addEventListener("error", function () {
        available = false;
        playing = false;
        syncUi();
      });

      audio.addEventListener("pause", function () {
        playing = false;
        syncUi();
      });

      audio.addEventListener("play", function () {
        playing = true;
        syncUi();
      });

      return audio;
    }

    function play() {
      if (!available) return Promise.resolve(false);
      var el = ensureAudio();
      return el
        .play()
        .then(function () {
          playing = true;
          syncUi();
          fadeTo(VOLUME);
          persist(true);
          return true;
        })
        .catch(function () {
          playing = false;
          syncUi();
          return false;
        });
    }

    function pause() {
      persist(false);
      if (!audio) {
        syncUi();
        return;
      }
      fadeTo(0, function () {
        audio.pause();
        playing = false;
        syncUi();
      });
    }

    function toggle() {
      if (playing) pause();
      else play();
    }

    function init() {
      if (root) root.classList.toggle("is-hidden", opts.enabled === false);
      syncUi();
      if (button) button.addEventListener("click", toggle);
      if (available && wanted()) play();
    }

    return {
      init: init,
      play: play,
      pause: pause,
      toggle: toggle,
      isPlaying: function () {
        return playing;
      }
    };
  }

  return { create: create };
})();
