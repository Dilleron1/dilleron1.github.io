/**
 * counters.js — локальная статистика: просмотры, лайки, время.
 * Данные хранятся в localStorage, то есть считаются только для тебя.
 * Для настоящих просмотров со всех устройств подключи внешний счётчик (см. README).
 */
window.Counters = (function () {
  var PREFIX = "bio:";

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : raw;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(PREFIX + key, String(value));
    } catch (error) {
      /* приватный режим — молча пропускаем */
    }
  }

  function readNumber(key, fallback) {
    var raw = read(key, null);
    if (raw === null) return fallback;
    var parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function formatNumber(value) {
    var num = Number(value) || 0;
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(".0", "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "K";
    return String(num);
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateNumber(element, from, to, duration) {
    if (!element) return;
    var start = Number(from) || 0;
    var end = Number(to) || 0;
    var total = typeof duration === "number" ? duration : 900;
    var startedAt = null;

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      element.textContent = formatNumber(end);
      return;
    }

    function step(timestamp) {
      if (startedAt === null) startedAt = timestamp;
      var progress = Math.min(1, (timestamp - startedAt) / total);
      var current = start + (end - start) * easeOutCubic(progress);
      element.textContent = formatNumber(Math.round(current));
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  /** Считает заход и возвращает новое значение просмотров. */
  function registerView(seed) {
    var base = Number(seed) || 0;
    var current = readNumber("views", base);
    var total = current + 1;
    write("views", total);
    return total;
  }

  function getViews(seed) {
    return readNumber("views", Number(seed) || 0);
  }

  /** Часы в формате ЧЧ:ММ:СС по московскому времени. */
  function startClock(element, timeZone) {
    if (!element) return function () {};
    var zone = timeZone || "Europe/Moscow";
    var formatter;
    try {
      formatter = new Intl.DateTimeFormat("ru-RU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: zone
      });
    } catch (error) {
      formatter = null;
    }

    function render() {
      if (formatter) {
        element.textContent = formatter.format(new Date());
      } else {
        var now = new Date();
        element.textContent = [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map(function (part) {
            return String(part).padStart(2, "0");
          })
          .join(":");
      }
    }

    render();
    var timer = window.setInterval(render, 1000);
    return function () {
      window.clearInterval(timer);
    };
  }

  /** Сколько времени вкладка открыта: 0:07, 3:41, 1:02:15 */
  function startUptime(element) {
    if (!element) return function () {};
    var startedAt = Date.now();

    function render() {
      var seconds = Math.floor((Date.now() - startedAt) / 1000);
      var minutes = Math.floor(seconds / 60);
      var hours = Math.floor(minutes / 60);
      var text;

      if (hours > 0) {
        text =
          hours +
          ":" +
          String(minutes % 60).padStart(2, "0") +
          ":" +
          String(seconds % 60).padStart(2, "0");
      } else {
        text = minutes + ":" + String(seconds % 60).padStart(2, "0");
      }

      element.textContent = text;
    }

    render();
    var timer = window.setInterval(render, 1000);
    return function () {
      window.clearInterval(timer);
    };
  }

  return {
    formatNumber: formatNumber,
    animateNumber: animateNumber,
    registerView: registerView,
    getViews: getViews,
    startClock: startClock,
    startUptime: startUptime
  };
})();
