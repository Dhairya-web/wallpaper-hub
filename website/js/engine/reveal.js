/* ============================================================
   REVEAL — website showcase engine.

   PROVENANCE
   Trail styles are transcribed verbatim from assets/data/config.js
   ("starbloom-trail" and "gear-pi-trail"). The drawing algorithm is
   ported from the engine in index.html: drawGearPiTrailMask,
   drawGearPiCloudBorder and drawFadingTrailSegments. Both trails
   declare renderer "gearPi" in config, so they share one code path
   and differ only by style — the same is true here.

   COMPOSITING, as the engine actually does it:
     1. main canvas  <- resting artwork (+ living atmosphere)
     2. offscreen    <- solid trail mask, then source-in transformed
                        artwork, giving the revealed layer
     3. main canvas  <- UNDERLAY glow, screen-blended. This is drawn
                        BEFORE the composite, not on top of it, which
                        is why the trail reads as rim light around the
                        reveal rather than paint over it.
     4. main canvas  <- destination-out offscreen  (punch the hole)
                        then lighter offscreen     (add the reveal)

   Living adds the approved atmosphere only: petal drift, aurora mist,
   motes, constellation links, a STEADY starseed halo and rigid whole-
   scene parallax. No wind, no deformation, no material lighting.
   ============================================================ */

import { reduced, clamp, lerp } from '../lib/motion.js';

/* ---- transcribed from assets/data/config.js ---- */
export const TRAILS = {
  starbloom: {
    name: 'Starbloom Comet',
    mask: {
      ribbonWidthScale: 1.35, ribbonColor: 'rgba(0,0,0,1)', ribbonOpacity: 1,
      cloudScale: 0.9, cloudColor: 'rgba(0,0,0,1)',
      cloud: [['M',0,-1.4],['C',0.15,-0.4,0.4,-0.15,1.4,0],['C',0.4,0.15,0.15,0.4,0,1.4],
              ['C',-0.15,0.4,-0.4,0.15,-1.4,0],['C',-0.4,-0.15,-0.15,-0.4,0,-1.4],['Z']]
    },
    overlay: {
      blend: 'screen',
      ribbons: [{ w: 1.8, c: 'rgba(91,220,222,0.4)', o: 0.25 },
                { w: 0.8, c: 'rgba(255,255,255,1.0)', o: 0.8 }],
      clouds:  [{ s: 1.7,  c: 'rgba(91,220,222,0.3)',  o: 0.2 },
                { s: 0.9,  c: 'rgba(230,188,102,0.7)', o: 0.5 },
                { s: 0.35, c: 'rgba(255,255,255,1.0)', o: 1.0 }]
    }
  },
  gearPi: {
    name: 'Gear Pi Cloud',
    mask: {
      ribbonWidthScale: 1.34, ribbonColor: 'rgba(0,0,0,0.99)', ribbonOpacity: 1,
      cloudScale: 0.82, cloudColor: 'rgba(0,0,0,0.99)',
      cloud: [['M',-1.08,0.26],['C',-1.14,-0.08,-0.92,-0.38,-0.62,-0.38],
              ['C',-0.58,-0.78,-0.22,-0.94,0.08,-0.74],['C',0.34,-1,0.76,-0.78,0.72,-0.46],
              ['C',1.04,-0.46,1.22,-0.12,1.02,0.16],['C',1.10,0.48,0.70,0.72,0.38,0.54],
              ['C',0.10,0.82,-0.30,0.74,-0.46,0.52],['C',-0.76,0.68,-1.12,0.56,-1.08,0.26],['Z']]
    },
    overlay: {
      blend: 'screen',
      ribbons: [{ w: 1.56, c: 'rgba(190,176,235,0.78)', o: 0.08 },
                { w: 1.44, c: 'rgba(255,255,255,0.92)', o: 0.11 }],
      clouds:  [{ s: 0.88, c: 'rgba(190,176,235,0.78)', o: 0.07 },
                { s: 0.85, c: 'rgba(255,255,255,0.92)', o: 0.10 }]
    }
  },
  minimal: {
    name: 'Minimal Reveal',
    mask: { ribbonWidthScale: 1.2, ribbonColor: 'rgba(0,0,0,1)', ribbonOpacity: 1,
            cloudScale: 0, cloudColor: 'rgba(0,0,0,1)', cloud: null },
    overlay: { blend: 'screen', ribbons: [], clouds: [] }
  }
};

/* Per-theme interaction shaping, also from config.js.
   headRadius is the sizing authority for every trail:
     HEAD_RADIUS = max(minimum, min(w,h) * viewportScale)
   Getting this wrong is what makes a trail read as a thin scratch
   instead of the comet the artwork was designed around. */
export const RIBBON = {
  'aeren-sol': { alphaExponent: 1.12, tailWidthScale: 0.56, lifeWidthScale: 0.40,
                 headRadius: { minimum: 130, viewportScale: 0.24 }, baseTrailDurationMs: 760 },
  'luffy':     { alphaExponent: 1.08, tailWidthScale: 0.58, lifeWidthScale: 0.42,
                 headRadius: { minimum: 130, viewportScale: 0.24 }, baseTrailDurationMs: 850 },
  _default:    { alphaExponent: 1.08, tailWidthScale: 0.58, lifeWidthScale: 0.42,
                 headRadius: { minimum: 130, viewportScale: 0.24 }, baseTrailDurationMs: 850 }
};

const DPR_CAP = 2;
const smoothstep = t => t * t * (3 - 2 * t);

export class Reveal {
  constructor({ mount, base, reveal, trail = 'starbloom', theme = 'aeren-sol',
                living = true, persistence = null, dprCap = DPR_CAP }) {
    this.mount = mount;
    this.srcA = base; this.srcB = reveal;
    this.trailId = trail;
    this.ribbon = RIBBON[theme] || RIBBON._default;   // resolved first: head size
                                                      // and decay both read from it
    this.living = living && !reduced();
    /* A canvas never needs more pixels than its source image can
       supply. The derivatives top out at 1920 wide, so a full-viewport
       mount on a 2x display would be compositing 5.2M pixels a frame
       to upscale a 1920px picture. Callers that cover a lot of screen
       pass a lower ceiling. */
    this.dprCap = dprCap;
    this.persistence = persistence ?? this.ribbon.baseTrailDurationMs;
    this.wipe = 0;

    this.pts = [];
    this.sx = 0; this.sy = 0; this.hasSmooth = false;
    this.raf = null; this.dead = false; this.on = false; this.ready = false;
    this.px = .5; this.py = .5; this.cx = .5; this.cy = .5;
    this.last = performance.now();

    this.cv = document.createElement('canvas');
    this.cv.setAttribute('role', 'img');
    this.ctx = this.cv.getContext('2d');              // alpha:true — the
    this.mk = document.createElement('canvas');       // punch-out needs it
    this.mctx = this.mk.getContext('2d');
    mount.appendChild(this.cv);

    this.A = new Image(); this.A.decoding = 'async';
    this.B = new Image(); this.B.decoding = 'async';

    this.#seed(); this.#measure(); this.#bind(); this.#load();
  }

  get trail() { return TRAILS[this.trailId] || TRAILS.starbloom; }

  /* ---------- lifecycle ---------- */
  #load() {
    const one = (im, src) => new Promise(r => { im.onload = () => r(true); im.onerror = () => r(false); im.src = src; });
    Promise.all([one(this.A, this.srcA), one(this.B, this.srcB)]).then(([a, b]) => {
      if (this.dead) return;
      this.ready = a; this.hasB = b;
      this.mount.dispatchEvent(new CustomEvent('reveal:ready'));
      this.paint(); this.#wake();
    });
  }

  #seed() {
    const R = (a, b) => a + Math.random() * (b - a);
    this.motes = Array.from({ length: 38 }, () => ({
      x: Math.random(), y: Math.random(), vx: R(-1.1e-4, 1.1e-4), vy: R(-4.2e-4, -1.1e-4),
      r: R(.8, 2.3), a: R(.2, .7), gold: Math.random() > .6 }));
    this.petals = Array.from({ length: 14 }, () => ({
      x: Math.random(), y: Math.random(), vx: R(-2.2e-4, 2.2e-4), vy: R(-3.2e-4, -1e-4),
      r: R(3, 6.5), a: R(.14, .40), rot: Math.random() * Math.PI, spin: R(-.004, .004) }));
    this.mist = Array.from({ length: 4 }, () => ({
      x: Math.random(), y: R(.45, .95), vx: R(-8e-5, 8e-5), r: R(.2, .38), a: R(.05, .10) }));
  }

  #measure() {
    const r = this.mount.getBoundingClientRect();
    if (!r.width || !r.height) { this.w = this.h = 0; return; }
    this.dpr = Math.min(devicePixelRatio || 1, this.dprCap);
    this.w = Math.round(r.width * this.dpr);
    this.h = Math.round(r.height * this.dpr);
    for (const c of [this.cv, this.mk]) { c.width = this.w; c.height = this.h; }
    const hr = this.ribbon.headRadius;
    this.head = Math.max(hr.minimum * this.dpr, Math.min(this.w, this.h) * hr.viewportScale);
  }

  #fit(img, ox = 0, oy = 0) {
    const s = Math.max(this.w / img.naturalWidth, this.h / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    return [(this.w - dw) / 2 + ox, (this.h - dh) / 2 + oy, dw, dh];
  }

  #bind() {
    this.ro = new ResizeObserver(() => { this.#measure(); this.paint(); });
    this.ro.observe(this.mount);
    this.io = new IntersectionObserver(([e]) => {
      this.on = e.isIntersecting; this.on ? this.#wake() : this.#sleep();
    }, { rootMargin: '12% 0px' });
    this.io.observe(this.mount);
    this.onVis = () => document.hidden ? this.#sleep() : this.#wake();
    document.addEventListener('visibilitychange', this.onVis);

    const at = e => {
      const r = this.mount.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: (t.clientX - r.left) * this.dpr, y: (t.clientY - r.top) * this.dpr };
    };
    this.push = p => {
      if (!this.ready) return;
      const L = this.pts[this.pts.length - 1];
      if (L) {
        const dx = p.x - L.x, dy = p.y - L.y, d = Math.hypot(dx, dy), step = this.head * .34;
        if (d > step) {
          const n = Math.min(Math.ceil(d / step), 16);
          for (let i = 1; i < n; i++)
            this.pts.push({ x: L.x + dx * i / n, y: L.y + dy * i / n, t: performance.now() });
        }
      }
      this.pts.push({ x: p.x, y: p.y, t: performance.now() });
      if (this.pts.length > 260) this.pts.splice(0, this.pts.length - 260);
      if (!this.hasSmooth) { this.sx = p.x; this.sy = p.y; this.hasSmooth = true; }
      this.#wake();
    };
    this.onMove = e => {
      const p = at(e); this.push(p);
      this.px = clamp(p.x / this.w, 0, 1); this.py = clamp(p.y / this.h, 0, 1);
      this.mount.dispatchEvent(new CustomEvent('reveal:touched'));
    };
    this.mount.addEventListener('pointermove', this.onMove);
    this.mount.addEventListener('pointerdown', this.onMove);
    this.mount.addEventListener('pointerleave', () => { this.px = .5; this.py = .5; });
    this.mount.addEventListener('touchmove', this.onMove, { passive: true });
    this.mount.addEventListener('touchstart', this.onMove, { passive: true });
  }

  /* ---------- controls ---------- */
  setTrail(id) { if (TRAILS[id]) { this.trailId = id; this.paint(); } }
  setLiving(v) { this.living = v && !reduced(); if (!v) { this.px = .5; this.py = .5; } this.#wake(); this.paint(); }
  setWipe(p) { this.wipe = clamp(p, 0, 1); this.#wake(); }

  sweep() {
    if (!this.ready || !this.w) return;
    const t0 = performance.now(), dur = 2300;
    const run = () => {
      if (this.dead) return;
      const k = (performance.now() - t0) / dur;
      if (k >= 1) return;
      this.push({ x: this.w * (.1 + .8 * k), y: this.h * (.5 + Math.sin(k * Math.PI * 2.2) * .2) });
      requestAnimationFrame(run);
    };
    run();
  }

  /* ---------- loop ---------- */
  #life(p) { return clamp(1 - (performance.now() - p.t) / this.persistence, 0, 1); }
  #busy() {
    return this.pts.length > 0 || this.living ||
           Math.abs(this.cx - this.px) > .002 || Math.abs(this.cy - this.py) > .002;
  }
  #wake() {
    if (this.raf || this.dead || document.hidden || !this.on || !this.ready) return;
    this.last = performance.now();
    const loop = () => {
      const now = performance.now(), dt = Math.min(now - this.last, 50);
      this.last = now;
      this.#step(dt); this.paint();
      this.raf = (this.#busy() && !document.hidden && this.on) ? requestAnimationFrame(loop) : null;
    };
    this.raf = requestAnimationFrame(loop);
  }
  #sleep() { if (this.raf) { cancelAnimationFrame(this.raf); this.raf = null; } }

  #step(dt) {
    const now = performance.now();
    if (this.pts.length) {
      const cut = now - this.persistence;
      let i = 0; while (i < this.pts.length && this.pts[i].t < cut) i++;
      if (i) this.pts.splice(0, i);
    }
    // smoothed head position, as the engine keeps a smoothed pointer
    const L = this.pts[this.pts.length - 1];
    if (L) { const k = 1 - Math.pow(.0015, dt / 1000); this.sx = lerp(this.sx, L.x, k); this.sy = lerp(this.sy, L.y, k); }

    const k = 1 - Math.pow(.001, dt / 1000);
    this.cx = lerp(this.cx, this.living ? this.px : .5, k);
    this.cy = lerp(this.cy, this.living ? this.py : .5, k);
    if (!this.living) return;
    const f = dt / 16.67;
    for (const m of this.motes) {
      m.x += m.vx * f; m.y += m.vy * f;
      if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
      if (m.x < -.02) m.x = 1.02; else if (m.x > 1.02) m.x = -.02;
    }
    for (const p of this.petals) {
      p.x += p.vx * f; p.y += p.vy * f; p.rot += p.spin * f;
      if (p.y < -.04) { p.y = 1.04; p.x = Math.random(); }
      if (p.x < -.04) p.x = 1.04; else if (p.x > 1.04) p.x = -.04;
    }
    for (const s of this.mist) { s.x += s.vx * f; if (s.x < -.4) s.x = 1.4; else if (s.x > 1.4) s.x = -.4; }
  }

  /* ---------- geometry, ported from the engine ---------- */
  #tracePath(c, x, y, r, cmds) {
    c.beginPath();
    const R = Math.max(0.1, r);
    for (const k of cmds) {
      if (k[0] === 'M') c.moveTo(x + k[1] * R, y + k[2] * R);
      else if (k[0] === 'C') c.bezierCurveTo(x + k[1] * R, y + k[2] * R, x + k[3] * R, y + k[4] * R, x + k[5] * R, y + k[6] * R);
      else c.closePath();
    }
  }

  /* drawFadingTrailSegments — midpoint-to-midpoint quadratic sections,
     stroked individually with round caps, width and alpha driven by
     per-point life. This is the shipped architecture. */
  #segments(c, widthScale, color, opacityScale, solid = false) {
    const P = this.pts;
    if (P.length < 2) return;
    const R = this.ribbon;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = color;
    for (let i = 0; i < P.length; i++) {
      const prev = P[Math.max(0, i - 1)], p = P[i], next = P[Math.min(P.length - 1, i + 1)];
      const life = this.#life(p);
      if (life <= 0) continue;
      const e = smoothstep(life);
      const sx = i === 0 ? p.x : (prev.x + p.x) * .5;
      const sy = i === 0 ? p.y : (prev.y + p.y) * .5;
      const ex = i === P.length - 1 ? p.x : (p.x + next.x) * .5;
      const ey = i === P.length - 1 ? p.y : (p.y + next.y) * .5;
      c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(p.x, p.y, ex, ey);
      let alpha = opacityScale * Math.pow(e, R.alphaExponent);
      let width = this.head * widthScale * (R.tailWidthScale + e * R.lifeWidthScale);
      if (solid) { alpha = 1; width *= e; }
      c.globalAlpha = alpha;
      c.lineWidth = Math.max(.5, width);
      c.stroke();
    }
    c.globalAlpha = 1;
  }

  /* ---------- paint ---------- */
  paint() {
    if (!this.ready || !this.w || !this.h) return;
    const c = this.ctx;
    const amp = this.living ? Math.min(this.w, this.h) * .012 : 0;
    const ox = (this.cx - .5) * -2 * amp, oy = (this.cy - .5) * -2 * amp;

    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    c.clearRect(0, 0, this.w, this.h);
    c.drawImage(this.A, ...this.#fit(this.A, ox, oy));

    if (this.hasB && this.wipe > 0) this.#paintWipe(ox, oy);
    if (this.living) this.#paintAir();
    if (this.hasB && this.pts.length) this.#paintTrail(ox, oy);
  }

  #paintTrail(ox, oy) {
    const m = this.mctx, c = this.ctx, T = this.trail;
    const head = this.pts[this.pts.length - 1];
    const headLife = this.#life(head);
    const headEase = smoothstep(headLife);

    /* --- 1. offscreen: solid mask, then the transformed artwork --- */
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1;
    m.clearRect(0, 0, this.w, this.h);
    this.#segments(m, T.mask.ribbonWidthScale, T.mask.ribbonColor, T.mask.ribbonOpacity, true);
    if (T.mask.cloud && headEase > 0) {
      this.#tracePath(m, this.sx, this.sy, this.head * T.mask.cloudScale * headEase, T.mask.cloud);
      m.fillStyle = T.mask.cloudColor; m.globalAlpha = 1; m.fill();
    }
    m.globalCompositeOperation = 'source-in';
    m.drawImage(this.B, ...this.#fit(this.B, ox, oy));

    /* --- 2. UNDERLAY onto the main canvas, before the composite --- */
    const O = T.overlay;
    if (O.ribbons.length || O.clouds.length) {
      c.save();
      c.globalCompositeOperation = O.blend;
      for (const L of O.ribbons) this.#segments(c, L.w, L.c, L.o);
      for (const L of O.clouds) {
        this.#tracePath(c, this.sx, this.sy, this.head * L.s, T.mask.cloud);
        c.globalAlpha = L.o * headLife;
        c.fillStyle = L.c;
        c.fill();
      }
      c.restore();
    }

    /* --- 3. erase, then replace ---
       The engine follows destination-out with 'lighter', which works
       there because both layers get an equal dimming pass first. This
       site shows the artwork undimmed, so 'lighter' would blow out the
       antialiased mask edge. 'source-over' gives the same interior and
       a clean edge, and matches the erase-and-replace semantics the
       project records as the current compositing behaviour. */
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'destination-out';
    c.drawImage(this.mk, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.drawImage(this.mk, 0, 0);
  }

  /* scroll-driven transformation, same punch-and-add compositing */
  #paintWipe(ox, oy) {
    const m = this.mctx, c = this.ctx, W = this.w, H = this.h;
    const edge = this.wipe * (W * 1.2) - W * .1;
    const feather = Math.max(this.head * 1.6, W * .05);

    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalCompositeOperation = 'source-over'; m.globalAlpha = 1;
    m.clearRect(0, 0, W, H);
    m.drawImage(this.B, ...this.#fit(this.B, ox, oy));
    m.globalCompositeOperation = 'destination-in';
    const g = m.createLinearGradient(edge - feather, 0, edge + feather, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    m.fillStyle = g; m.fillRect(0, 0, W, H);

    if (this.wipe > .01 && this.wipe < .99) this.#boundary(edge);

    c.globalCompositeOperation = 'destination-out'; c.drawImage(this.mk, 0, 0);
    c.globalCompositeOperation = 'source-over'; c.drawImage(this.mk, 0, 0);
  }

  #boundary(edge) {
    const c = this.ctx, H = this.h, T = TRAILS.starbloom;
    c.save(); c.globalCompositeOperation = 'screen';
    const grd = c.createLinearGradient(edge - this.head, 0, edge + this.head * .6, 0);
    grd.addColorStop(0, 'rgba(91,220,222,0)');
    grd.addColorStop(.55, 'rgba(91,220,222,0.16)');
    grd.addColorStop(.8, 'rgba(230,188,102,0.14)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = grd; c.fillRect(edge - this.head, 0, this.head * 1.6, H);
    for (let i = 0; i < 5; i++) {
      const y = H * (.16 + i * .17) + Math.sin(this.wipe * 6 + i) * H * .05;
      const r = this.head * (.30 + (i % 2) * .16);
      for (const L of T.overlay.clouds) {
        c.globalAlpha = L.o * .8; c.fillStyle = L.c;
        this.#tracePath(c, edge, y, r * L.s, T.mask.cloud); c.fill();
      }
    }
    c.restore(); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  }

  #paintAir() {
    const c = this.ctx, W = this.w, H = this.h, u = this.dpr;
    c.save(); c.globalCompositeOperation = 'screen';
    for (const s of this.mist) {
      const R = s.r * W;
      const g = c.createRadialGradient(s.x * W, s.y * H, 0, s.x * W, s.y * H, R);
      g.addColorStop(0, `rgba(91,220,222,${s.a})`); g.addColorStop(1, 'rgba(91,220,222,0)');
      c.fillStyle = g; c.fillRect(s.x * W - R, s.y * H - R, R * 2, R * 2);
    }
    c.globalCompositeOperation = 'lighter'; c.lineWidth = .6 * u;
    const reach = Math.min(W, H) * .12;
    for (let i = 0; i < this.motes.length; i++) for (let j = i + 1; j < this.motes.length; j++) {
      const a = this.motes[i], b = this.motes[j];
      const d = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
      if (d < reach) {
        c.strokeStyle = `rgba(91,220,222,${(1 - d / reach) * .12})`;
        c.beginPath(); c.moveTo(a.x * W, a.y * H); c.lineTo(b.x * W, b.y * H); c.stroke();
      }
    }
    for (const m of this.motes) {
      c.fillStyle = m.gold ? `rgba(230,188,102,${m.a})` : `rgba(91,220,222,${m.a})`;
      c.beginPath(); c.arc(m.x * W, m.y * H, m.r * u, 0, 7); c.fill();
    }
    c.globalCompositeOperation = 'screen';
    for (const p of this.petals) {
      c.save(); c.translate(p.x * W, p.y * H); c.rotate(p.rot);
      c.fillStyle = `rgba(244,248,252,${p.a})`;
      c.beginPath(); c.ellipse(0, 0, p.r * u, p.r * .4 * u, 0, 0, 7); c.fill(); c.restore();
    }
    const hx = W * .5, hy = H * .56, R = Math.min(W, H) * .2;
    const g = c.createRadialGradient(hx, hy, 0, hx, hy, R);
    g.addColorStop(0, 'rgba(230,188,102,.12)'); g.addColorStop(.45, 'rgba(91,220,222,.055)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(hx - R, hy - R, R * 2, R * 2);
    c.restore(); c.globalCompositeOperation = 'source-over';
  }

  destroy() {
    this.dead = true; this.#sleep();
    this.ro?.disconnect(); this.io?.disconnect();
    document.removeEventListener('visibilitychange', this.onVis);
    this.A.src = ''; this.B.src = '';
    this.cv.remove();
  }
}
