/**
 * background.js — частицы на canvas: точки и связи между ними.
 */
window.Background = (function () {
  var TWO_PI = Math.PI * 2;

  var state = {
    canvas: null,
    ctx: null,
    particles: [],
    width: 0,
    height: 0,
    dpr: 1,
    raf: 0,
    running: false,
    pointer: { x: -9999, y: -9999, active: false },
    config: { particles: 70, speed: 0.35, linkDistance: 130 },
    palette: { accent: "168, 85, 247", hot: "232, 121, 249" }
  };

  /** Цвета берём из CSS-переменных, чтобы тема жила в одном месте. */
  function readPalette() {
    var styles = window.getComputedStyle(document.documentElement);
    var accent = styles.getPropertyValue("--accent-rgb");
    var hot = styles.getPropertyValue("--hot-rgb");
    if (accent && accent.trim()) state.palette.accent = accent.trim();
    if (hot && hot.trim()) state.palette.hot = hot.trim();
  }

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function particleCount() {
    var area = state.width * state.height;
    var base = Math.round(area / 16000);
    var target = Math.min(state.config.particles, Math.max(24, base));
    if (window.innerWidth < 520) target = Math.round(target * 0.6);
    return target;
  }

  function makeParticle() {
    var speed = state.config.speed;
    return {
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: (Math.random() - 0.5) * speed * 2,
      vy: (Math.random() - 0.5) * speed * 2,
      r: Math.random() * 1.6 + 0.7,
      hue: Math.random() > 0.72 ? "hot" : "accent"
    };
  }

  function resize() {
    var rect = state.canvas.getBoundingClientRect();
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(1, Math.round(rect.width));
    state.height = Math.max(1, Math.round(rect.height));
    state.canvas.width = Math.round(state.width * state.dpr);
    state.canvas.height = Math.round(state.height * state.dpr);
    state.ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    seed();
  }

  function seed() {
    var count = particleCount();
    var list = [];
    for (var i = 0; i < count; i++) {
      if (state.particles[i]) {
        var old = state.particles[i];
        old.x = Math.min(old.x, state.width);
        old.y = Math.min(old.y, state.height);
        list.push(old);
      } else {
        list.push(makeParticle());
      }
    }
    state.particles = list;
  }

  function move(p) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0) {
      p.x = 0;
      p.vx *= -1;
    } else if (p.x > state.width) {
      p.x = state.width;
      p.vx *= -1;
    }

    if (p.y < 0) {
      p.y = 0;
      p.vy *= -1;
    } else if (p.y > state.height) {
      p.y = state.height;
      p.vy *= -1;
    }

    if (state.pointer.active) {
      var dx = p.x - state.pointer.x;
      var dy = p.y - state.pointer.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 110 && dist > 0.01) {
        var push = (110 - dist) / 110 * 0.45;
        p.x += (dx / dist) * push;
        p.y += (dy / dist) * push;
      }
    }
  }

  function drawLinks() {
    var limit = state.config.linkDistance;
    var limitSq = limit * limit;
    var particles = state.particles;

    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var distSq = dx * dx + dy * dy;
        if (distSq > limitSq) continue;

        var alpha = (1 - distSq / limitSq) * 0.28;
        state.ctx.strokeStyle =
          "rgba(" + state.palette.accent + ", " + alpha.toFixed(3) + ")";
        state.ctx.lineWidth = 0.7;
        state.ctx.beginPath();
        state.ctx.moveTo(particles[i].x, particles[i].y);
        state.ctx.lineTo(particles[j].x, particles[j].y);
        state.ctx.stroke();
      }
    }
  }

  function drawParticles() {
    var particles = state.particles;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      state.ctx.beginPath();
      state.ctx.arc(p.x, p.y, p.r, 0, TWO_PI);
      state.ctx.fillStyle =
        p.hue === "hot"
          ? "rgba(" + state.palette.hot + ", 0.9)"
          : "rgba(" + state.palette.accent + ", 0.85)";
      state.ctx.fill();
    }
  }

  function frame() {
    state.ctx.clearRect(0, 0, state.width, state.height);
    for (var i = 0; i < state.particles.length; i++) move(state.particles[i]);
    drawLinks();
    drawParticles();
    state.raf = window.requestAnimationFrame(frame);
  }

  function start() {
    if (state.running) return;
    state.running = true;
    state.raf = window.requestAnimationFrame(frame);
  }

  function stop() {
    state.running = false;
    window.cancelAnimationFrame(state.raf);
  }

  function onPointerMove(event) {
    var point = event.touches ? event.touches[0] : event;
    if (!point) return;
    var rect = state.canvas.getBoundingClientRect();
    state.pointer.x = point.clientX - rect.left;
    state.pointer.y = point.clientY - rect.top;
    state.pointer.active = true;
  }

  function onPointerLeave() {
    state.pointer.active = false;
    state.pointer.x = -9999;
    state.pointer.y = -9999;
  }

  function bindVisibility() {
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else if (!prefersReducedMotion()) start();
    });
  }

  function init(canvas, config) {
    if (!canvas) return;
    if (config) {
      state.config.particles = config.particles || state.config.particles;
      state.config.speed = config.speed || state.config.speed;
      state.config.linkDistance = config.linkDistance || state.config.linkDistance;
    }

    state.canvas = canvas;
    state.ctx = canvas.getContext("2d");
    if (!state.ctx) return;

    readPalette();
    resize();

    if (prefersReducedMotion()) {
      state.ctx.clearRect(0, 0, state.width, state.height);
      drawParticles();
      return;
    }

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 140);
    });

    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("mouseout", onPointerLeave);
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerLeave);
    bindVisibility();

    start();
  }

  return { init: init, stop: stop, start: start };
})();
