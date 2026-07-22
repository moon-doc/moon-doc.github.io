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
    const count = Math.round((window.innerWidth * window.innerHeight) / 4000);
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.4 + 0.3) * DPR,
        base: Math.random() * 0.5 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.006,
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

// ===== 华丽流星系统 =====
(function initShootingStars() {
  const container = document.querySelector('.shooting-stars');
  if (!container) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let W, H;

  function resize() {
    W = canvas.width = container.clientWidth * DPR;
    H = canvas.height = container.clientHeight * DPR;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // 流星对象池
  const meteors = [];

  function spawnMeteor() {
    // 随机起点，偏上方偏左侧
    const startX = Math.random() * W * 0.8;
    const startY = Math.random() * H * 0.4;
    // 角度 -18° ~ -35°
    const angle = -(Math.random() * 17 + 18) * Math.PI / 180;
    const speed = (Math.random() * 6 + 8) * DPR;
    // 尾巴长度
    const tailLen = (Math.random() * 180 + 120) * DPR;
    const life = Math.random() * 60 + 50; // 帧
    // 颜色：白/淡蓝/淡金
    const colors = [
      { r: 255, g: 255, b: 255 },
      { r: 200, g: 220, b: 255 },
      { r: 255, g: 240, b: 200 },
      { r: 180, g: 210, b: 255 },
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    meteors.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed * -1, // 往右下
      // 实际上 angle 是负的，cos > 0, sin < 0；我们要往右下飞
      // 重新算：向右下飞，角度约 155° ~ 168°（从 x 正轴逆时针）
      // 简化：vx 正，vy 正
      vx2: Math.cos((Math.random() * 17 + 18) * Math.PI / 180) * speed,
      vy2: Math.sin((Math.random() * 17 + 18) * Math.PI / 180) * speed,
      tailLen,
      life, maxLife: life,
      color,
      width: (Math.random() * 1.2 + 0.8) * DPR,
      trail: [],
      sparkles: [],
    });
  }

  // 简化：流星向右下飞
  function spawnMeteorV2() {
    const startX = Math.random() * W * 0.7 - W * 0.1;
    const startY = Math.random() * H * 0.35;
    const angDeg = Math.random() * 20 + 20; // 20~40度
    const speed = (Math.random() * 7 + 9) * DPR;
    const tailLen = (Math.random() * 160 + 100) * DPR;
    const life = Math.random() * 70 + 50;
    const colors = [
      { r: 255, g: 255, b: 255 },
      { r: 200, g: 225, b: 255 },
      { r: 255, g: 235, b: 195 },
      { r: 170, g: 205, b: 255 },
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const rad = angDeg * Math.PI / 180;

    meteors.push({
      x: startX, y: startY,
      vx: Math.cos(rad) * speed,
      vy: Math.sin(rad) * speed,
      tailLen,
      life, maxLife: life,
      color,
      width: (Math.random() * 1.5 + 0.8) * DPR,
      trail: [],
      sparkles: [],
    });
  }

  // 定时生成流星
  let spawnTimer = 0;
  const spawnInterval = () => Math.random() * 80 + 30; // 30~110 帧间隔

  let nextSpawn = spawnInterval();

  function update() {
    ctx.clearRect(0, 0, W, H);

    spawnTimer++;
    if (spawnTimer >= nextSpawn) {
      spawnMeteorV2();
      // 偶尔一次生成 2-3 颗（流星雨）
      if (Math.random() < 0.2) {
        spawnMeteorV2();
        if (Math.random() < 0.3) spawnMeteorV2();
      }
      spawnTimer = 0;
      nextSpawn = spawnInterval();
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life--;
      if (m.life <= 0) {
        meteors.splice(i, 1);
        continue;
      }

      // 记录轨迹
      m.trail.push({ x: m.x, y: m.y });
      // 尾巴最多保留 tailLen / speed 个点 ≈ 固定长度
      const maxTrail = Math.floor(m.tailLen / Math.sqrt(m.vx * m.vx + m.vy * m.vy) * 1.2);
      if (m.trail.length > maxTrail) m.trail.shift();

      m.x += m.vx;
      m.y += m.vy;

      // 生命透明度：淡入 + 淡出
      const fadeIn = Math.min(1, (m.maxLife - m.life) / 8);
      const fadeOut = Math.min(1, m.life / 15);
      const masterAlpha = fadeIn * fadeOut;

      // 绘制尾巴
      if (m.trail.length > 1) {
        for (let j = 1; j < m.trail.length; j++) {
          const t = j / m.trail.length; // 0(尾端) -> 1(头端)
          const alpha = t * t * masterAlpha;
          const lw = m.width * (t * 0.8 + 0.2);
          ctx.beginPath();
          ctx.moveTo(m.trail[j - 1].x, m.trail[j - 1].y);
          ctx.lineTo(m.trail[j].x, m.trail[j].y);
          ctx.strokeStyle = `rgba(${m.color.r},${m.color.g},${m.color.b},${alpha})`;
          ctx.lineWidth = lw;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }

      // 头部亮点 + 辉光
      const headAlpha = masterAlpha;
      // 外层辉光
      const glowR = m.width * 8;
      const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, glowR);
      glow.addColorStop(0, `rgba(${m.color.r},${m.color.g},${m.color.b},${headAlpha * 0.6})`);
      glow.addColorStop(0.3, `rgba(${m.color.r},${m.color.g},${m.color.b},${headAlpha * 0.2})`);
      glow.addColorStop(1, `rgba(${m.color.r},${m.color.g},${m.color.b},0)`);
      ctx.beginPath();
      ctx.arc(m.x, m.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();

      // 核心亮点
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.width * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.min(255, m.color.r + 40)},${Math.min(255, m.color.g + 30)},${Math.min(255, m.color.b + 30)},${headAlpha * 0.95})`;
      ctx.fill();

      // 散落的火花粒子
      if (Math.random() < 0.35 && masterAlpha > 0.3) {
        m.sparkles.push({
          x: m.x + (Math.random() - 0.5) * 4 * DPR,
          y: m.y + (Math.random() - 0.5) * 4 * DPR,
          vx: (Math.random() - 0.5) * 2 * DPR,
          vy: (Math.random() - 0.5) * 2 * DPR + DPR * 0.5,
          life: Math.random() * 15 + 8,
          maxLife: 0,
          r: (Math.random() * 1.2 + 0.4) * DPR,
        });
        m.sparkles[m.sparkles.length - 1].maxLife = m.sparkles[m.sparkles.length - 1].life;
      }

      // 更新火花
      for (let si = m.sparkles.length - 1; si >= 0; si--) {
        const sp = m.sparkles[si];
        sp.life--;
        if (sp.life <= 0) {
          m.sparkles.splice(si, 1);
          continue;
        }
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.03 * DPR; // 微重力
        const spAlpha = (sp.life / sp.maxLife) * masterAlpha * 0.7;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${m.color.r},${m.color.g},${m.color.b},${spAlpha})`;
        ctx.fill();
      }
    }

    requestAnimationFrame(update);
  }

  update();
})();

// ===== 鼠标光晕跟随 =====
(function initCursorGlow() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed; pointer-events: none; z-index: 1;
    width: 400px; height: 400px; border-radius: 50%;
    background: radial-gradient(circle, rgba(180,200,255,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
    opacity: 0;
  `;
  document.body.appendChild(glow);
  let visible = false;

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if (!visible) { glow.style.opacity = '1'; visible = true; }
  });
  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0'; visible = false;
  });
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

// ===== 展示图 3D 视差跟随 =====
(function initTilt() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
  const items = document.querySelectorAll('[data-tilt]');
  items.forEach((media) => {
    const frame = media.querySelector('.show-frame');
    if (!frame) return;
    media.addEventListener('mousemove', (e) => {
      const r = media.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      frame.style.transform =
        `rotateX(${(-py * 10).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg) scale(1.02)`;
    });
    media.addEventListener('mouseleave', () => {
      frame.style.transform = '';
    });
  });
})();

// ===== 功能卡片悬浮涟漪 =====
(function initCardRipple() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  document.querySelectorAll('.feature-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--ripple-x', x + 'px');
      card.style.setProperty('--ripple-y', y + 'px');
    });
  });
})();
