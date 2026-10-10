/* ============================================================
   CHROME — header, drawer, footer, cursor.
   Mounted once for the app lifetime. The router only reports
   which route is current, so navigation never re-binds anything
   and listeners cannot accumulate.
   ============================================================ */

import { reduced, finePointer, lerp } from '../lib/motion.js';

export const ROUTES = [
  { p: '/',            l: 'Home',        n: '01' },
  { p: '/aeren-sol',   l: 'Aeren Sol',   n: '02' },
  { p: '/wallpapers',  l: 'Wallpapers',  n: '03' },
  { p: '/commissions', l: 'Commissions', n: '04' },
  { p: '/journal',     l: 'Journal',     n: '05' },
  { p: '/about',       l: 'Studio',      n: '06' }
];

/* the starseed, from the engine's Starbloom cloud path */
const SEED_D = 'M0-1.4C.15-.4.4-.15 1.4 0 .4.15.15.4 0 1.4-.15.4-.4.15-1.4 0-.4-.15-.15-.4 0-1.4Z';
const MARK = `<svg viewBox="-2 -2 4 4" aria-hidden="true"><path d="${SEED_D}" fill="url(#mg)"/>
  <defs><linearGradient id="mg" x1="-2" y1="-2" x2="2" y2="2">
  <stop stop-color="#5BDCDE"/><stop offset="1" stop-color="#E6BC66"/></linearGradient></defs></svg>`;

export function mountChrome() {
  document.getElementById('hdr').innerHTML = `
    <header class="hdr" id="siteHdr">
      <div class="wrap hdr-in">
        <a class="mark" href="#/" aria-label="Wallpaper Hub, home">${MARK}<span>WALLPAPER HUB</span></a>
        <nav class="nav" aria-label="Primary">
          ${ROUTES.map(r => `<a href="#${r.p}" data-p="${r.p}">${r.l}</a>`).join('')}
        </nav>
        <div class="hdr-r">
          <button class="burger" id="burger" aria-expanded="false" aria-controls="drawer" aria-label="Open menu">
            <span></span><span></span>
          </button>
        </div>
      </div>
    </header>
    <nav class="drawer" id="drawer" aria-label="Menu" hidden>
      ${ROUTES.map(r => `<a href="#${r.p}" data-p="${r.p}"><i>${r.n}</i>${r.l}</a>`).join('')}
    </nav>`;

  document.getElementById('ftr').innerHTML = `
    <footer class="ftr">
      <div class="wrap">
        <div class="ftr-top">
          <p class="ftr-say">Worlds you can live with.</p>
          <div class="ftr-cols">
            <div><h5>Explore</h5><ul>
              <li><a href="#/aeren-sol">Aeren Sol</a></li>
              <li><a href="#/wallpapers">Wallpapers</a></li>
              <li><a href="#/journal">Journal</a></li>
              <li><a href="#/about">Studio</a></li>
            </ul></div>
            <div><h5>Studio</h5><ul>
              <li><a href="#/commissions">Commission a world</a></li>
              <li><a href="#/commissions">What we need</a></li>
              <li><a href="#/about">How it works</a></li>
            </ul></div>
            <div><h5>Targets</h5><ul>
              <li><a href="#/wallpapers">Browser engine</a></li>
              <li><a href="#/wallpapers">Lively Wallpaper</a></li>
              <li><a href="#/wallpapers">Wallpaper Engine — planned</a></li>
            </ul></div>
          </div>
        </div>
        <div class="ftr-bot">
          <span>© ${new Date().getFullYear()} Wallpaper Hub</span>
          <span>Prototype · Aeren Sol in development</span>
        </div>
      </div>
    </footer>`;

  wireHeader();
  if (finePointer()) mountCursor();
}

/* ---------- header, bound exactly once ---------- */
function wireHeader() {
  const hdr = document.getElementById('siteHdr');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  let tick = false;
  let nearTop = true;

  /* The header used to hide and show on scroll direction, which made it
     flicker on any small correction. It now behaves like a piece of chrome
     that is simply out of the way: once you are past the first screen it
     retreats, and it comes back when the pointer approaches the top edge.
     Touch devices have no pointer to approach with, so it never hides there. */
  /* Proximity is the ONLY thing that shows the header. No scroll threshold
     and no scroll-direction rule — those made it flicker on any correction.

     Two guards stop it hair-triggering as the pointer drifts across the
     boundary while reading:
       · hysteresis — it appears at 130px but does not leave until 260px,
         so movement around the edge cannot toggle it
       · a hide delay — a brief pass through the upper area never dismisses
         it mid-gesture                                                    */
  /* Two conditions, both required:
       1. the last scroll movement was UPWARD (or we are at the very top)
       2. the pointer is near the top edge
     Either alone is not enough. Scrolling up with the cursor low leaves it
     hidden; drifting the cursor up while reading downward leaves it hidden.
     That is what stopped it appearing on its own the moment scrolling ended.

     Hysteresis (130 / 260) and a hide delay keep it from hair-triggering as
     the pointer drifts across the boundary. */
  const SHOW_AT = 130;
  const HIDE_AT = 260;
  const HIDE_DELAY = 450;
  /* A trackpad emits small reverse deltas constantly, so "any upward pixel"
     is not a usable signal. The header requires a DELIBERATE upward scroll:
     upward movement has to accumulate past this before it counts, and any
     downward movement resets the accumulator. */
  const UP_INTENT = 70;
  const coarse = matchMedia('(pointer: coarse)').matches;
  let hideTimer = null;
  let scrolledUp = true;                   // page opens at the top
  let lastY = scrollY;
  let upAccum = 0;

  const apply = () => {
    hdr.classList.toggle('stuck', scrollY > 20);
    const allowed = (scrolledUp || scrollY < 60) && nearTop;
    const shouldHide = !coarse
      && !allowed
      && !drawer.classList.contains('open')
      && !hdr.contains(document.activeElement);
    hdr.classList.toggle('gone', shouldHide);
  };

  const setNear = near => {
    if (near === nearTop) return;
    clearTimeout(hideTimer);
    if (near) { nearTop = true; apply(); }
    else hideTimer = setTimeout(() => { nearTop = false; apply(); }, HIDE_DELAY);
  };

  addEventListener('scroll', () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      const d = y - lastY;
      lastY = y;
      if (d > 0) {                       // any downward movement cancels intent
        upAccum = 0;
        if (scrolledUp) { scrolledUp = false; }
      } else if (d < 0) {
        upAccum -= d;                    // d is negative; accumulate magnitude
        if (upAccum >= UP_INTENT) scrolledUp = true;
      }
      apply();
      tick = false;
    });
  }, { passive: true });

  if (!coarse) {
    addEventListener('pointermove', e => {
      if (e.clientY < SHOW_AT) setNear(true);
      else if (e.clientY > HIDE_AT) setNear(false);
    }, { passive: true });
    document.addEventListener('focusin', () => {
      if (hdr.contains(document.activeElement)) { clearTimeout(hideTimer); nearTop = true; apply(); }
    });
  }

  const set = open => {
    if (open) drawer.hidden = false;
    drawer.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      hdr.classList.remove('gone');
    } else {
      apply();
      setTimeout(() => { if (!drawer.classList.contains('open')) drawer.hidden = true; }, 620);
    }
  };
  burger.addEventListener('click', () => set(!drawer.classList.contains('open')));
  drawer.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) { set(false); burger.focus(); }
  });
  addEventListener('hashchange', () => set(false));
}

export function markRoute(path) {
  document.querySelectorAll('[data-p]').forEach(a => {
    a.dataset.p === path ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}

/* ============================================================
   CURSOR
   The native pointer is hidden in CSS. This is the only pointer
   on fine-pointer devices. Over the reveal stage it becomes the
   Starbloom seed, so the thing you drag is the thing revealing.
   ============================================================ */
function mountCursor() {
  const cur = document.createElement('div');
  cur.className = 'cur';
  cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = `
    <div class="cur-ring"></div>
    <svg class="cur-seed" viewBox="-2 -2 4 4">
      <path d="${SEED_D}" fill="rgba(91,220,222,.30)" transform="scale(1.7)"/>
      <path d="${SEED_D}" fill="rgba(230,188,102,.70)" transform="scale(.9)"/>
      <path d="${SEED_D}" fill="#fff" transform="scale(.35)"/>
    </svg>
    <span class="cur-lbl" id="curLbl"></span>`;
  const dot = document.createElement('div');
  dot.className = 'cur-dot';
  dot.setAttribute('aria-hidden', 'true');
  document.body.append(cur, dot);
  const lbl = cur.querySelector('#curLbl');

  let mx = -200, my = -200, rx = -200, ry = -200, raf = null, live = false;
  const run = () => {
    // reduced motion still gets a cursor, it just does not trail
    const e = reduced() ? 1 : 0.19;
    rx = lerp(rx, mx, e); ry = lerp(ry, my, e);
    cur.style.transform = `translate3d(${rx.toFixed(1)}px,${ry.toFixed(1)}px,0)`;
    raf = (Math.abs(rx - mx) > .2 || Math.abs(ry - my) > .2) ? requestAnimationFrame(run) : null;
  };

  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;
    if (!live) { live = true; cur.classList.add('live'); dot.classList.add('live'); }
    if (!raf) raf = requestAnimationFrame(run);
  }, { passive: true });

  const HOT = 'a,button,input,textarea,select,[role="button"]';
  addEventListener('pointerover', e => {
    // Over the live demo the pointer disappears entirely: the Starbloom
    // head IS the cursor there, and a second marker on top of it only
    // competes with the trail.
    const ctl = e.target.closest('.stage-meta');
    const onStage = !ctl && e.target.closest('.stage');
    const hot = !onStage && e.target.closest(HOT);
    cur.classList.toggle('vanish', !!onStage);
    cur.classList.toggle('hot', !!hot);
    // label only where the element has no text of its own to obscure
    lbl.textContent = (hot && hot.dataset.cur) ? hot.dataset.cur : '';
  });
  document.addEventListener('mouseleave', () => { cur.classList.remove('live'); dot.classList.remove('live'); live = false; });
  document.addEventListener('mouseenter', () => { cur.classList.add('live'); dot.classList.add('live'); live = true; });
}
