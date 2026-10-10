/* ============================================================
   MOTION — everything that moves asks this module first.
   ============================================================ */

const rmq = matchMedia('(prefers-reduced-motion: reduce)');
const fine = matchMedia('(hover: hover) and (pointer: fine)');
export const reduced = () => rmq.matches;
export const finePointer = () => fine.matches;

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

/* ============================================================
   SMOOTH SCROLL
   Native scroll position is kept authoritative — we only ease
   toward it. That keeps position:fixed, sticky, anchors and
   IntersectionObserver working exactly as the browser intends,
   unlike a transformed wrapper. Off for touch and reduced motion.
   ============================================================ */
let ss = null;
export function smoothScroll() {
  if (reduced() || !finePointer()) return null;

  const S = {
    target: window.scrollY,
    current: window.scrollY,
    raf: null,
    running: false,
    ease: 0.098,
    velocity: 0
  };

  const max = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const frame = () => {
    const prev = S.current;
    S.current = lerp(S.current, S.target, S.ease);
    S.velocity = S.current - prev;
    if (Math.abs(S.target - S.current) < 0.12) {
      S.current = S.target;
      S.velocity = 0;
      window.scrollTo(0, S.current);
      S.raf = null; S.running = false;
      return;
    }
    window.scrollTo(0, S.current);
    S.raf = requestAnimationFrame(frame);
  };

  const kick = () => { if (!S.raf) { S.running = true; S.raf = requestAnimationFrame(frame); } };

  const onWheel = e => {
    if (e.ctrlKey) return;                     // pinch-zoom belongs to the browser
    if (e.target.closest('[data-native-scroll]')) return;
    e.preventDefault();
    S.target = clamp(S.target + e.deltaY, 0, max());
    kick();
  };

  const onKey = e => {
    const k = e.key;
    if (e.target.matches('input,textarea,select')) return;
    const page = window.innerHeight * 0.86;
    let d = 0;
    if (k === 'PageDown' || k === ' ') d = page;
    else if (k === 'PageUp') d = -page;
    else if (k === 'ArrowDown') d = 110;
    else if (k === 'ArrowUp') d = -110;
    else if (k === 'Home') { S.target = 0; kick(); return; }
    else if (k === 'End') { S.target = max(); kick(); return; }
    else return;
    e.preventDefault();
    S.target = clamp(S.target + d, 0, max());
    kick();
  };

  // if anything else moves the page (anchors, focus, resize) adopt it
  const resync = () => { if (!S.running) { S.target = window.scrollY; S.current = window.scrollY; } };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('keydown', onKey);
  window.addEventListener('resize', resync, { passive: true });
  document.addEventListener('focusin', resync);

  ss = {
    to(y) { S.target = clamp(y, 0, max()); kick(); },
    reset() { S.target = S.current = window.scrollY; },
    velocity: () => S.velocity,
    destroy() {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', resync);
      document.removeEventListener('focusin', resync);
      if (S.raf) cancelAnimationFrame(S.raf);
    }
  };
  return ss;
}
export const scroller = () => ss;

/* ============================================================
   SPLIT TEXT — wraps each word so it can carry its cyan and
   gold ghost (see .echo in base.css). Spaces are preserved as
   real text nodes so selection and screen readers stay intact.
   ============================================================ */
export function echoText(el) {
  if (!el || el.dataset.split) return;
  el.dataset.split = '1';

  // <br> is honoured so headlines break where they were written to break,
  // not where the container happens to run out of room.
  const lines = el.innerHTML.split(/<br\s*\/?>/i)
    .map(l => l.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').trim())
    .filter(Boolean);

  el.setAttribute('aria-label', lines.join(' '));
  const frag = document.createDocumentFragment();
  let i = 0;

  lines.forEach((line, li) => {
    if (li) frag.append(document.createElement('br'));
    line.split(/\s+/).forEach((word, wi) => {
      if (wi) frag.append(document.createTextNode(' '));
      const s = document.createElement('span');
      s.className = 'w';
      s.dataset.t = word;
      s.textContent = word;
      s.style.setProperty('--i', i++);
      s.setAttribute('aria-hidden', 'true');
      frag.append(s);
    });
  });
  el.replaceChildren(frag);
}

/* ============================================================
   SCROLL ENTRANCE — reveal once, then stop observing.
   ============================================================ */
let io = null;
export function observeUp(root = document) {
  const els = root.querySelectorAll('.up:not(.on), .echo:not(.on)');
  if (!els.length) return;
  if (reduced() || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('on'));
    return;
  }
  if (!io) {
    io = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
  }
  els.forEach(e => io.observe(e));
}
export function resetUp() { if (io) { io.disconnect(); io = null; } }

/* ============================================================
   SCROLL PROGRESS — drives the pinned transform section.
   One shared rAF, only alive while a tracked element is near.
   ============================================================ */
const tracked = new Set();
let pRaf = null, pIo = null;

export function trackProgress(el, cb) {
  if (!el) return;
  el._cb = cb;
  el._p = undefined;
  tracked.add(el);
  if (!pIo) {
    pIo = new IntersectionObserver(es => {
      for (const e of es) e.target._near = e.isIntersecting;
      pump();
    }, { rootMargin: '30% 0px' });
  }
  pIo.observe(el);
  cb(0);
}

function pump() {
  if (pRaf) return;
  const step = () => {
    let live = false;
    const vh = window.innerHeight;
    for (const el of tracked) {
      if (!el.isConnected) { tracked.delete(el); continue; }
      if (!el._near) continue;
      live = true;
      const r = el.getBoundingClientRect();
      let p;
      if (el._mode === 'viewport') {
        // -1 below the fold .. 1 above it, continuous while on screen
        p = clamp(((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2), -1, 1);
      } else {
        const span = r.height - vh;
        p = span > 0 ? clamp(-r.top / span, 0, 1) : (r.top < vh ? 1 : 0);
      }
      if (el._p !== p) { el._p = p; el._cb(p); }
    }
    pRaf = live ? requestAnimationFrame(step) : null;
  };
  pRaf = requestAnimationFrame(step);
}

export function clearProgress() {
  tracked.clear();
  if (pIo) { pIo.disconnect(); pIo = null; }
  if (pRaf) { cancelAnimationFrame(pRaf); pRaf = null; }
}

/* ---------- parallax on a media element ----------
   Registered in 'viewport' mode so it receives a continuous
   -1..1 signal while on screen rather than a 0/1 span.        */
export function parallax(el, depth = 0.1, scale = 1.1) {
  if (reduced() || !el) return;
  el._mode = 'viewport';
  el.style.willChange = 'transform';
  trackProgress(el, p => {
    el.style.transform = `translate3d(0,${(p * depth * 100).toFixed(2)}px,0) scale(${scale})`;
  });
}

/* ---------- magnetic micro-interaction ---------- */
export function magnet(el, k = 0.24) {
  if (reduced() || !finePointer() || !el) return () => {};
  let raf = null, tx = 0, ty = 0, cx = 0, cy = 0;
  const run = () => {
    cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
    el.style.transform = `translate3d(${cx.toFixed(2)}px,${cy.toFixed(2)}px,0)`;
    raf = (Math.abs(cx - tx) > 0.08 || Math.abs(cy - ty) > 0.08) ? requestAnimationFrame(run) : null;
  };
  const move = e => {
    const r = el.getBoundingClientRect();
    tx = (e.clientX - (r.left + r.width / 2)) * k;
    ty = (e.clientY - (r.top + r.height / 2)) * k;
    if (!raf) raf = requestAnimationFrame(run);
  };
  const out = () => { tx = ty = 0; if (!raf) raf = requestAnimationFrame(run); };
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', out);
  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', out);
    if (raf) cancelAnimationFrame(raf);
  };
}
