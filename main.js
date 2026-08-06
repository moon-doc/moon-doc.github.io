// ===== 随机古文劝进 =====
(function initQuote() {
  const quotes = [
    // 易经
    '君子终日乾乾，夕惕若厉，无咎',
    '天行健，君子以自强不息',
    '地势坤，君子以厚德载物',
    '君子以裒多益寡，称物平施',
    '君子以向晦入宴息',
    '君子以慎德辟难，不可荣以禄',
    '君子以常德行，习教事',
    '君子以虚受人',
    '君子以立不易方',
    '君子以远小人，不恶而严',
    '君子以非礼弗履',
    '君子以慎德辟难，不可荣以禄',
    '君子以慎起居，俟时不可躁',
    '雷动风行，散而后成',
    '日新其德，刚健笃实',
    // 大学
    '知止而后有定，定而后能静，静而后能安',
    '物有本末，事有终始，知所先后，则近道矣',
    '苟日新，日日新，又日新',
    '大学之道，在明明德，在亲民，在止于至善',
    '心诚求之，虽不中不远矣',
    '德者本也，财者末也',
    '所恶于上，毋以使下；所恶于下，毋以事上',
    '君子有大道，必忠信以得之',
    '生财有大道，生之者众，食之者寡',
    // 中庸
    '博学之，审问之，慎思之，明辨之，笃行之',
    '君子尊德性而道问学',
    '致广大而尽精微，极高明而道中庸',
    '人一能之，己百之；人十能之，己千之',
    '君子内省不疚，无恶于志',
    '万物并育而不相害，道并行而不相悖',
    '诚者，天之道也；诚之者，人之道也',
    '君子素其位而行，不愿乎其外',
    // 其他经典
    '如切如磋，如琢如磨',
    '士不可不弘毅，任重而道远',
    '博观而约取，厚积而薄发',
    '不积跬步，无以至千里；不积小流，无以成江海',
    '吾生也有涯，而知也无涯',
    '功崇惟志，业广惟勤',
    '穷则独善其身，达则兼济天下',
    '纸上得来终觉浅，绝知此事要躬行',
    '路虽远行则将至，事虽难做则必成',
    '莫等闲，白了少年头，空悲切',
    '见贤思齐焉，见不贤而内自省也',
    '业精于勤，荒于嬉；行成于思，毁于随',
  ];
  const el = document.getElementById('hero-quote');
  if (!el) return;
  el.textContent = '「' + quotes[Math.floor(Math.random() * quotes.length)] + '」';
})();

// ===== 星空 Canvas：明月高悬 · 璀璨银河 =====
(function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, stars = [], brightStars = [], nebulae = [];
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    w = canvas.width = window.innerWidth * DPR;
    h = canvas.height = window.innerHeight * DPR;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    milkyWayCanvas = null; // 重建银河
    buildStars();
  }

  // 色温更丰富：蓝白、暖黄、淡紫、微红
  function randomHue() {
    const r = Math.random();
    if (r < 0.30) return 220;       // 蓝白
    if (r < 0.50) return 260;       // 淡紫
    if (r < 0.65) return 45;        // 暖黄
    if (r < 0.78) return 15;        // 微红
    if (r < 0.88) return 190;       // 青蓝
    return 340;                      // 浅粉
  }

  function buildStars() {
    const area = window.innerWidth * window.innerHeight;
    // 三层星空：远景小星(多)、中景(中)、近景亮星(少)
    const farCount = Math.round(area / 2200);
    const midCount = Math.round(area / 5000);
    const brightCount = Math.round(area / 18000);

    stars = [];
    // 远景：密、小、暗
    for (let i = 0; i < farCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 0.8 + 0.2) * DPR,
        base: Math.random() * 0.35 + 0.15,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.012 + 0.004,
        hue: randomHue(),
        layer: 0,
      });
    }
    // 中景：适中
    for (let i = 0; i < midCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.2 + 0.5) * DPR,
        base: Math.random() * 0.45 + 0.35,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.008,
        hue: randomHue(),
        layer: 1,
      });
    }

    // 近景亮星：大、亮、有十字星芒
    brightStars = [];
    for (let i = 0; i < brightCount; i++) {
      brightStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (Math.random() * 1.8 + 1.2) * DPR,
        base: Math.random() * 0.3 + 0.65,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.025 + 0.01,
        hue: randomHue(),
        spikeLen: (Math.random() * 12 + 8) * DPR,
        spikeAngle: Math.random() * Math.PI,
        spikeSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    // 星云/气体云
    nebulae = [];
    const nebulaCount = Math.round(area / 80000) + 2;
    for (let i = 0; i < nebulaCount; i++) {
      nebulae.push({
        x: Math.random() * w,
        y: Math.random() * h,
        rx: (Math.random() * 300 + 150) * DPR,
        ry: (Math.random() * 180 + 80) * DPR,
        hue: [220, 260, 280, 300, 200, 45][Math.floor(Math.random() * 6)],
        alpha: Math.random() * 0.04 + 0.015,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.003 + 0.001,
      });
    }
  }

  // ── 银河带：模拟真实银河从右下地平线升起、斜贯左上 ──
  // 预渲染到离屏 canvas，避免每帧重绘密集星尘
  let milkyWayCanvas = null;
  function buildMilkyWayCanvas() {
    milkyWayCanvas = document.createElement('canvas');
    milkyWayCanvas.width = w;
    milkyWayCanvas.height = h;
    const mctx = milkyWayCanvas.getContext('2d');

    // 银河走向：约 -30° 从右下→左上，中心偏右下（银心）
    const angle = -32 * Math.PI / 180;
    // 银心位置：右侧偏下
    const cx = w * 0.68;
    const cy = h * 0.62;

    mctx.save();
    mctx.translate(cx, cy);
    mctx.rotate(angle);

    // 银河主体长度和基础宽度
    const bandLen = Math.max(w, h) * 1.6;
    const baseWidth = h * 0.18;

    // ── 银河绘制策略：沿短轴用径向渐变控制宽度扩散 ──
    // ── 沿长轴用线性渐变控制银心→两端衰减 ──
    // 两层叠加才能得到自然的带状效果

    const bandLayers = [
      // 外层弥散光晕
      { w: bandLen, h: baseWidth * 2.2, alpha: 0.03, hue: 240, sat: 40 },
      // 主光带
      { w: bandLen, h: baseWidth * 1.3, alpha: 0.055, hue: 255, sat: 50 },
      // 核心亮带
      { w: bandLen * 0.8, h: baseWidth * 0.55, alpha: 0.08, hue: 248, sat: 55 },
      // 银心附近暖色核心
      { w: bandLen * 0.4, h: baseWidth * 0.45, alpha: 0.07, hue: 38, sat: 60 },
      // 银心最亮核
      { w: bandLen * 0.18, h: baseWidth * 0.3, alpha: 0.09, hue: 30, sat: 65 },
    ];

    for (const l of bandLayers) {
      const halfH = l.h * 0.5;
      const halfW = l.w * 0.5;

      // 短轴：径向渐变，中心亮向上下两边渐灭
      const yGrad = mctx.createRadialGradient(0, 0, 0, 0, 0, halfH);
      yGrad.addColorStop(0, `hsla(${l.hue}, ${l.sat}%, 72%, ${l.alpha})`);
      yGrad.addColorStop(0.5, `hsla(${l.hue}, ${l.sat}%, 65%, ${l.alpha * 0.55})`);
      yGrad.addColorStop(0.8, `hsla(${l.hue}, ${l.sat - 10}%, 55%, ${l.alpha * 0.18})`);
      yGrad.addColorStop(1, 'transparent');

      mctx.save();
      // 长轴裁剪：用线性渐变做 mask，银心处亮、两端渐灭
      mctx.beginPath();
      mctx.rect(-halfW, -halfH, l.w, l.h);
      mctx.clip();

      mctx.fillStyle = yGrad;
      // 拉伸径向渐变覆盖长轴区域
      mctx.save();
      mctx.scale(halfW / halfH, 1);
      mctx.beginPath();
      mctx.arc(0, 0, halfH, 0, Math.PI * 2);
      mctx.fillStyle = yGrad;
      mctx.fill();
      mctx.restore();

      // 长轴衰减：叠加一个横向线性渐变做透明度遮罩
      const xMask = mctx.createLinearGradient(-halfW, 0, halfW, 0);
      xMask.addColorStop(0, 'rgba(5,6,15,0.95)');
      xMask.addColorStop(0.15, 'rgba(5,6,15,0.4)');
      xMask.addColorStop(0.4, 'rgba(5,6,15,0)');
      xMask.addColorStop(0.6, 'rgba(5,6,15,0)');
      xMask.addColorStop(0.85, 'rgba(5,6,15,0.4)');
      xMask.addColorStop(1, 'rgba(5,6,15,0.95)');
      mctx.globalCompositeOperation = 'destination-out';
      mctx.fillStyle = xMask;
      mctx.fillRect(-halfW, -halfH, l.w, l.h);
      mctx.globalCompositeOperation = 'source-over';

      mctx.restore();
    }

    // ── 暗尘带（银河中部的暗纹）──
    // 一条比银河稍窄的暗带，沿中线偏移
    const dustGrad = mctx.createLinearGradient(0, -baseWidth * 0.15, 0, baseWidth * 0.15);
    dustGrad.addColorStop(0, 'transparent');
    dustGrad.addColorStop(0.35, 'rgba(5, 6, 15, 0.12)');
    dustGrad.addColorStop(0.5, 'rgba(5, 6, 15, 0.18)');
    dustGrad.addColorStop(0.65, 'rgba(5, 6, 15, 0.12)');
    dustGrad.addColorStop(1, 'transparent');
    mctx.fillStyle = dustGrad;
    mctx.fillRect(-bandLen * 0.45, -baseWidth * 0.15, bandLen * 0.9, baseWidth * 0.3);

    mctx.restore();

    // ── 银河中的密集星尘 ──
    // 沿银河走向分布，高斯分布集中在中轴线上
    mctx.save();
    mctx.translate(cx, cy);
    mctx.rotate(angle);

    const dustCount = Math.round(w * h / 6000);
    // 银河星尘颜色：蓝白为主，少量暖色
    const dustHues = [220, 230, 240, 250, 260, 45, 30];
    for (let i = 0; i < dustCount; i++) {
      // 长轴位置：银心附近更密
      const longPos = (Math.random() + Math.random() - 1) * bandLen * 0.48;
      // 横向：高斯分布，中心最密
      const gauss3 = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const latPos = gauss3 * baseWidth * 0.55;
      // 银心附近星星更亮更密
      const distFromCenter = Math.abs(longPos) / (bandLen * 0.48);
      const brightBias = Math.max(0, 1 - distFromCenter * 1.2);

      const sr = (Math.random() * 0.7 + 0.15 + brightBias * 0.3) * DPR;
      const sa = (Math.random() * 0.35 + 0.1 + brightBias * 0.2);
      const shue = dustHues[Math.floor(Math.random() * dustHues.length)];

      mctx.beginPath();
      mctx.arc(longPos, latPos, sr, 0, Math.PI * 2);
      mctx.fillStyle = `hsla(${shue}, 65%, 86%, ${sa})`;
      mctx.fill();
    }

    // 银心附近的亮星团
    const clusterCount = Math.round(dustCount * 0.04);
    for (let i = 0; i < clusterCount; i++) {
      const longPos = (Math.random() - 0.5) * bandLen * 0.15;
      const latPos = (Math.random() + Math.random() - 1) * baseWidth * 0.2;
      const sr = (Math.random() * 1.2 + 0.8) * DPR;
      const sa = Math.random() * 0.4 + 0.4;
      mctx.beginPath();
      mctx.arc(longPos, latPos, sr, 0, Math.PI * 2);
      mctx.fillStyle = `hsla(40, 60%, 90%, ${sa})`;
      mctx.fill();
    }

    mctx.restore();
  }

  function drawMilkyWay() {
    if (!milkyWayCanvas) buildMilkyWayCanvas();
    ctx.drawImage(milkyWayCanvas, 0, 0);
  }

  // 绘制星云
  function drawNebulae(t) {
    for (const n of nebulae) {
      const pulse = Math.sin(t * n.speed + n.phase) * 0.15 + 1;
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.rx * pulse);
      grad.addColorStop(0, `hsla(${n.hue}, 55%, 60%, ${n.alpha * 1.2})`);
      grad.addColorStop(0.4, `hsla(${n.hue}, 45%, 50%, ${n.alpha * 0.6})`);
      grad.addColorStop(1, 'transparent');
      ctx.save();
      ctx.scale(1, n.ry / n.rx);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(n.x, n.y * (n.rx / n.ry), n.rx * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 绘制十字星芒
  function drawSpike(x, y, len, angle, alpha, hue) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const grad1 = ctx.createLinearGradient(-len, 0, len, 0);
    grad1.addColorStop(0, 'transparent');
    grad1.addColorStop(0.4, `hsla(${hue}, 80%, 92%, ${alpha * 0.4})`);
    grad1.addColorStop(0.5, `hsla(${hue}, 80%, 95%, ${alpha * 0.8})`);
    grad1.addColorStop(0.6, `hsla(${hue}, 80%, 92%, ${alpha * 0.4})`);
    grad1.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad1;
    ctx.lineWidth = 1.2 * DPR;
    ctx.beginPath();
    ctx.moveTo(-len, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();

    const grad2 = ctx.createLinearGradient(0, -len * 0.6, 0, len * 0.6);
    grad2.addColorStop(0, 'transparent');
    grad2.addColorStop(0.4, `hsla(${hue}, 80%, 92%, ${alpha * 0.3})`);
    grad2.addColorStop(0.5, `hsla(${hue}, 80%, 95%, ${alpha * 0.6})`);
    grad2.addColorStop(0.6, `hsla(${hue}, 80%, 92%, ${alpha * 0.3})`);
    grad2.addColorStop(1, 'transparent');
    ctx.strokeStyle = grad2;
    ctx.lineWidth = 0.8 * DPR;
    ctx.beginPath();
    ctx.moveTo(0, -len * 0.6);
    ctx.lineTo(0, len * 0.6);
    ctx.stroke();
    ctx.restore();
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    // 银河带
    drawMilkyWay();

    // 星云
    drawNebulae(t);

    // 普通星星（远景 + 中景）
    for (const s of stars) {
      s.phase += s.speed;
      const twinkle = s.base + Math.sin(s.phase) * 0.35;
      const alpha = Math.max(0, Math.min(1, twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 88%, ${alpha})`;
      if (s.layer === 1) {
        ctx.shadowBlur = 5 * DPR;
        ctx.shadowColor = `hsla(${s.hue}, 90%, 85%, ${alpha * 0.6})`;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 亮星 + 十字星芒
    for (const s of brightStars) {
      s.phase += s.speed;
      s.spikeAngle += s.spikeSpeed;
      const twinkle = s.base + Math.sin(s.phase) * 0.3;
      const alpha = Math.max(0, Math.min(1, twinkle));

      // 外层光晕
      const haloGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
      haloGrad.addColorStop(0, `hsla(${s.hue}, 70%, 92%, ${alpha * 0.5})`);
      haloGrad.addColorStop(0.3, `hsla(${s.hue}, 60%, 80%, ${alpha * 0.2})`);
      haloGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
      ctx.fill();

      // 十字星芒
      drawSpike(s.x, s.y, s.spikeLen * (0.8 + Math.sin(s.phase * 1.5) * 0.2), s.spikeAngle, alpha, s.hue);

      // 星点本体
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 94%, ${alpha})`;
      ctx.shadowBlur = 10 * DPR;
      ctx.shadowColor = `hsla(${s.hue}, 90%, 88%, ${alpha * 0.9})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (!reduceMotion) requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  if (reduceMotion) {
    for (const s of stars) s.phase = Math.PI / 2;
    for (const s of brightStars) s.phase = Math.PI / 2;
    ctx.clearRect(0, 0, w, h);
    drawMilkyWay();
    drawNebulae(0);
    for (const s of stars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 88%, ${s.base})`;
      ctx.fill();
    }
    for (const s of brightStars) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${s.hue}, 80%, 94%, ${s.base})`;
      ctx.fill();
    }
  } else {
    requestAnimationFrame(draw);
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

// ===== 图片点击放大 =====
(function initLightbox() {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = '<img class="lightbox-img" /><button class="lightbox-close" aria-label="关闭">✕</button>';
  document.body.appendChild(overlay);

  const img = overlay.querySelector('.lightbox-img');
  const close = overlay.querySelector('.lightbox-close');

  function open(src) {
    img.src = src;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeBox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const target = e.target.closest('img');
    if (!target) return;
    // 只对截图类图片放大
    const src = target.currentSrc || target.src;
    if (src && (target.closest('.show-media') || target.closest('.hero-shot-frame') || target.closest('.feature-visual') || target.closest('.theme-showcase'))) {
      open(src);
    }
  });

  close.addEventListener('click', closeBox);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeBox(); });
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

// ===== AI 轨道动画：粒子连线 + 节点脉冲 =====
(function initAIOrbit() {
  const canvas = document.getElementById('ai-canvas');
  const orbit = document.querySelector('.ai-orbit');
  if (!canvas || !orbit) return;

  const ctx = canvas.getContext('2d');
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h;
  const nodes = [];    // 四个功能节点中心
  const particles = []; // 沿轨道的粒子
  const TRAIL_COUNT = 6;
  let activeIdx = -1;
  let lastSwitch = 0;
  const SWITCH_INTERVAL = 2800;

  function resize() {
    const rect = orbit.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    canvas.width = w * DPR;
    canvas.height = h * DPR;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    computeNodes();
  }

  function computeNodes() {
    nodes.length = 0;
    orbit.querySelectorAll('.ai-node').forEach((el) => {
      const r = el.getBoundingClientRect();
      const or = orbit.getBoundingClientRect();
      nodes.push({
        x: r.left - or.left + r.width / 2,
        y: r.top - or.top + r.height / 2,
        el,
      });
    });
  }

  function buildParticles() {
    particles.length = 0;
    // 每条边 4 个粒子
    const pairs = [[0,1],[1,3],[3,2],[2,0],[0,3],[1,2]];
    pairs.forEach(([a,b]) => {
      for (let i = 0; i < TRAIL_COUNT; i++) {
        particles.push({ a, b, t: i / TRAIL_COUNT, speed: .002 + Math.random() * .0015 });
      }
    });
  }

  // 粒子沿贝塞尔曲线移动
  function bezierPoint(p0, p1, p2, t) {
    const u = 1 - t;
    return { x: u*u*p0.x + 2*u*t*p1.x + t*t*p2.x, y: u*u*p0.y + 2*u*t*p1.y + t*t*p2.y };
  }

  function getControlPoint(a, b) {
    // 控制点朝中心偏移，形成弧线
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    const mx = w / 2, my = h / 2;
    return { x: cx + (mx - cx) * .4, y: cy + (my - cy) * .4 };
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    if (!nodes.length) { requestAnimationFrame(draw); return; }

    const now = performance.now();

    // 自动轮播高亮
    if (now - lastSwitch > SWITCH_INTERVAL) {
      activeIdx = (activeIdx + 1) % nodes.length;
      lastSwitch = now;
      nodes.forEach((n, i) => n.el.classList.toggle('active', i === activeIdx));
    }

    // 画连线（贝塞尔曲线）
    const pairs = [[0,1],[1,3],[3,2],[2,0],[0,3],[1,2]];
    pairs.forEach(([a, b]) => {
      const na = nodes[a], nb = nodes[b];
      if (!na || !nb) return;
      const cp = getControlPoint(na, nb);
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.quadraticCurveTo(cp.x, cp.y, nb.x, nb.y);
      ctx.strokeStyle = 'rgba(66,185,131,.1)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 画粒子
    particles.forEach((p) => {
      p.t += p.speed;
      if (p.t > 1) p.t -= 1;
      const na = nodes[p.a], nb = nodes[p.b];
      if (!na || !nb) return;
      const cp = getControlPoint(na, nb);
      const pos = bezierPoint(na, cp, nb, p.t);
      const alpha = .35 + .25 * Math.sin(p.t * Math.PI);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(66,185,131,${alpha})`;
      ctx.fill();
    });

    // 中心到高亮节点的脉冲光线
    if (activeIdx >= 0 && nodes[activeIdx]) {
      const an = nodes[activeIdx];
      const cx = w / 2, cy = h / 2;
      const progress = ((now - lastSwitch) % SWITCH_INTERVAL) / SWITCH_INTERVAL;
      const pulsePos = { x: cx + (an.x - cx) * progress, y: cy + (an.y - cy) * progress };
      const grad = ctx.createRadialGradient(pulsePos.x, pulsePos.y, 0, pulsePos.x, pulsePos.y, 12);
      grad.addColorStop(0, 'rgba(66,185,131,.6)');
      grad.addColorStop(1, 'rgba(66,185,131,0)');
      ctx.beginPath();
      ctx.arc(pulsePos.x, pulsePos.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => { resize(); buildParticles(); }, { passive: true });
  resize();
  buildParticles();
  if (!reduceMotion) {
    requestAnimationFrame(draw);
  }
})();
