/**
 * typewriter.js — поочерёдно печатает и стирает фразы в элементе.
 */
window.Typewriter = (function () {
  var TYPE_SPEED = 55;
  var DELETE_SPEED = 28;
  var HOLD_DELAY = 1700;
  var SWITCH_DELAY = 380;

  function create(element, phrases, options) {
    var opts = options || {};
    var list = (phrases || []).filter(Boolean);
    var timer = null;
    var phraseIndex = 0;
    var charIndex = 0;
    var deleting = false;
    var paused = false;

    function reducedMotion() {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    }

    function renderStatic() {
      element.textContent = list[0] || "";
    }

    function schedule(delay) {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, delay);
    }

    function tick() {
      if (paused || !list.length) return;

      var phrase = list[phraseIndex % list.length];

      if (!deleting) {
        charIndex += 1;
        element.textContent = phrase.slice(0, charIndex);
        if (charIndex >= phrase.length) {
          deleting = true;
          schedule(HOLD_DELAY);
          return;
        }
        schedule(TYPE_SPEED);
        return;
      }

      charIndex -= 1;
      element.textContent = phrase.slice(0, Math.max(0, charIndex));
      if (charIndex <= 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % list.length;
        schedule(SWITCH_DELAY);
        return;
      }
      schedule(DELETE_SPEED);
    }

    function start() {
      if (!element || !list.length) return;
      if (reducedMotion()) {
        renderStatic();
        return;
      }
      if (opts.delay) schedule(opts.delay);
      else schedule(TYPE_SPEED);
    }

    function stop() {
      paused = true;
      window.clearTimeout(timer);
    }

    function resume() {
      if (!paused) return;
      paused = false;
      schedule(TYPE_SPEED);
    }

    return { start: start, stop: stop, resume: resume };
  }

  return { create: create };
})();
