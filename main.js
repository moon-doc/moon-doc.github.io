// ===== 星空 Canvas：明月高悬 · 星光闪耀 =====
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth * DPR;
    h = canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    buildStars();
  }

  function buildStars() {
    const count = Math.round((window.innerWidth * window.innerHeight) / 6000);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.3) * DPR,
        base: Math.random() * 0.5 + 0.3,
        // 闪烁相位与速度
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.006,
        // 少量星星偏暖偏冷，增加层次
        hue: Math.random() < 0.15 ? 45 : (Math.random() < 0.5 ? 220 : 260),
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      s.phase += s.speed;
      const twinkle = s.base + Math.sin(s.phase) * 0.35;
      const alpha = Math.max(0, Math.min(1, twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 88%, ${alpha})`;
      ctx.shadowBlur = 6 * DPR;
      ctx.shadowColor = `hsla(${s.hue}, 90%, 85%, ${alpha * 0.8})`;
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  if (reduceMotion) {
    // 静态渲染一帧
    for (const s of stars) s.phase = Math.PI / 2;
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 88%, ${s.base})`;
      ctx.fill();
    }
  } else {
    draw();
  }
})();

// ===== 滚动进场动画 =====
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // 同屏元素轻微错峰
          const delay = (entry.target.dataset.i || i % 6) * 60;
          setTimeout(() => entry.target.classList.add('in'), delay);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  els.forEach((el) => io.observe(el));
})();