/**
 * interactions.js — тост, копирование в буфер, наклон карточки, лайк.
 */
window.Interactions = (function () {
  var TOAST_DURATION = 2000;
  var TILT_MAX = 5;
  var toastTimer = null;
  var toastEl = null;
  var statRefs = { values: {}, nodes: {} };

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function isTouch() {
    return window.matchMedia && window.matchMedia("(hover: none)").matches;
  }

  function toast(message, type) {
    if (!toastEl) toastEl = document.getElementById("toast");
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.toggle("toast--error", type === "error");
    toastEl.classList.add("is-visible");

    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, TOAST_DURATION);
  }

  function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      field.setSelectionRange(0, value.length);

      var copied = false;
      try {
        copied = window.document.execCommand("copy");
      } catch (error) {
        copied = false;
      }

      document.body.removeChild(field);
      if (copied) resolve();
      else reject(new Error("copy failed"));
    });
  }

  function bindCopy() {
    document.addEventListener("click", function (event) {
      var node = event.target.closest("[data-copy]");
      if (!node) return;
      var value = node.dataset.copy;
      if (!value) return;

      event.preventDefault();
      copyText(value)
        .then(function () {
          toast("скопировано: " + value);
        })
        .catch(function () {
          toast("не удалось скопировать", "error");
        });
    });
  }

  function toggleLike(id) {
    var valueNode = statRefs.values[id];
    var statNode = statRefs.nodes[id];
    if (!valueNode || !statNode) return;

    var liked = window.Counters.hasLiked(id);
    var base = Number(window.PROFILE_LIKE_BASE) || 0;
    var current = window.Counters.getLikes(id, base);
    var next = liked ? Math.max(0, current - 1) : current + 1;

    if (!liked) window.Counters.markLiked(id);
    window.Counters.setLikes(id, next);

    statNode.classList.toggle("stat--liked", !liked);
    window.Counters.animateNumber(valueNode, current, next, 420);

    toast(liked ? "лайк убран" : "спасибо за лайк");
  }

  function bindLike() {
    var node = statRefs.nodes.likes;
    if (!node || !node.classList.contains("stat--button")) return;

    node.addEventListener("click", function () {
      toggleLike("likes");
    });

    node.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleLike("likes");
      }
    });
  }

  function bindTilt(card) {
    if (!card || isTouch() || prefersReducedMotion()) return;

    var frame = 0;

    function reset() {
      window.cancelAnimationFrame(frame);
      card.style.transform = "";
    }

    card.addEventListener("pointermove", function (event) {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(function () {
        var rect = card.getBoundingClientRect();
        var ratioX = (event.clientX - rect.left) / rect.width - 0.5;
        var ratioY = (event.clientY - rect.top) / rect.height - 0.5;
        var rotateY = (ratioX * TILT_MAX * 2).toFixed(2);
        var rotateX = (-ratioY * TILT_MAX * 2).toFixed(2);
        card.style.transform =
          "perspective(900px) rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
      });
    });

    card.addEventListener("pointerleave", reset);
    card.addEventListener("blur", reset);
  }

  function init(options) {
    var opts = options || {};
    toastEl = document.getElementById("toast");
    statRefs = opts.statRefs || statRefs;
    bindCopy();
    bindTilt(document.getElementById("card"));
    bindLike();
  }

  return { init: init, toast: toast, copyText: copyText, toggleLike: toggleLike };
})();
