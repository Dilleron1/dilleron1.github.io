// Walker now uses an actual image element (assets/boykisser.png) that walks across the background.
// Behavior: image moves left-right across the .bg parent, flips horizontally when changing direction,
// and has a gentle bobbing animation. Image is positioned with absolute CSS left/top in pixels.

(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const img = document.getElementById('walker-img');
    const canvas = document.getElementById('walker-canvas'); // kept for compatibility but hidden
    const parent = img ? img.parentElement : document.body;
    if (!img) return;

    // Initial bounds
    const rect = parent.getBoundingClientRect();

    // Starting position relative to parent
    let x = rect.width * 0.08; // 8%
    let y = rect.height * 0.65; // 65%

    // Size: keep image width in px; height auto
    function ensureSize(){
      const cssW = parseFloat(getComputedStyle(img).width) || 160;
      img._w = cssW;
      img._h = parseFloat(getComputedStyle(img).height) || (cssW);
    }
    ensureSize();

    // Velocity (px per second)
    let vx = 70; // positive to the right; negative to left

    // Flip horizontal when going left
    function updateFlip(){ img.style.transform = (vx < 0) ? 'scaleX(-1)' : 'scaleX(1)'; }
    updateFlip();

    // Bobbing
    function bobAt(t){ return Math.sin(t/250) * 6; }

    // Bounds for x: [0, parent.width - img.width]
    function bounds(){ const r = parent.getBoundingClientRect(); return {min:0, max: Math.max(0, r.width - (img._w||160))}; }

    // If image is outside on load because styles use % left/top, normalize to px
    function initStyle(){
      const left = img.style.left || '8%';
      const top = img.style.top || '60%';
      // resolve left
      if (left.toString().includes('%')) {
        const p = parseFloat(left)/100.0;
        x = parent.getBoundingClientRect().width * p;
      } else x = parseFloat(left);
      if (top.toString().includes('%')) {
        const p = parseFloat(top)/100.0;
        y = parent.getBoundingClientRect().height * p;
      } else y = parseFloat(top);
    }
    initStyle();

    let last = performance.now();
    let frameNow = last;

    function loop(now){
      const dt = (now - last)/1000; last = now;
      frameNow = now;

      // Move
      x += vx * dt;

      // Check bounds
      const b = bounds();
      if (x < b.min) { x = b.min; vx = Math.abs(vx); updateFlip(); }
      if (x > b.max) { x = b.max; vx = -Math.abs(vx); updateFlip(); }

      // Bob
      const by = bobAt(now);

      // Apply to style
      img.style.left = Math.round(x) + 'px';
      img.style.top = Math.round(y + by) + 'px';

      requestAnimationFrame(loop);
    }

    // Recompute size and bounds on resize
    window.addEventListener('resize', ()=>{ ensureSize(); });

    // If clicked, toggle direction (for fun)
    img.addEventListener('click', ()=>{ vx = -vx; updateFlip(); });

    requestAnimationFrame(loop);
  });
})();
