/* ============================================================
   PARTS — shared markup so every page renders the same objects
   the same way, and the component vocabulary stays small.
   ============================================================ */

import { srcset, src } from '../data/catalog.js';

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));

export const arw = (n = 16) =>
  `<svg width="${n}" height="${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

/* responsive image over the generated derivatives */
export function pic(id, state, alt, { sizes = '100vw', cls = '', eager = false, w = 1920 } = {}) {
  return `<img class="${cls}" src="${src(id, state, w)}" srcset="${srcset(id, state)}" sizes="${sizes}"
    alt="${esc(alt)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

/* ---------- reveal stage ---------- */
export function stage(w, { id = 'stage', hint = 'Drag across the artwork' } = {}) {
  return `
  <div class="stage" id="${id}" aria-label="${esc(w.title)} interactive reveal">
    <div class="stage-load" id="${id}L"><i></i><span class="sr">Loading artwork</span></div>
    <div class="stage-meta">
      <p class="stage-hint" id="${id}H">${esc(hint)}</p>
      <div class="stage-tools">
        <button id="${id}A" data-trail="${esc(w.trailId)}" aria-pressed="true">${esc(w.trail)}</button>
        <button id="${id}B" aria-pressed="false">Minimal</button>
        <button id="${id}S" data-cur="PLAY">Play</button>
      </div>
    </div>
  </div>`;
}

/* Wires a stage to an engine; returns an unbind for the router. */
export function wireStage(root, engine, id = 'stage') {
  const q = s => root.querySelector(s);
  const el = q(`#${id}`), load = q(`#${id}L`), hint = q(`#${id}H`);
  const a = q(`#${id}A`), b = q(`#${id}B`), s = q(`#${id}S`), sw = q('#liveSw');

  const ready = () => load?.classList.add('gone');
  const touched = () => hint?.classList.add('gone');
  el.addEventListener('reveal:ready', ready);
  el.addEventListener('reveal:touched', touched, { once: true });

  const real = a.dataset.trail || 'starbloom';
  const pickA = () => { a.setAttribute('aria-pressed','true'); b.setAttribute('aria-pressed','false'); engine.setTrail(real); };
  const pickB = () => { b.setAttribute('aria-pressed','true'); a.setAttribute('aria-pressed','false'); engine.setTrail('minimal'); };
  const play = () => { touched(); engine.sweep(); };
  a?.addEventListener('click', pickA);
  b?.addEventListener('click', pickB);
  s?.addEventListener('click', play);

  const onSw = e => engine.setLiving(e.target.checked);
  sw?.addEventListener('change', onSw);

  return () => {
    el.removeEventListener('reveal:ready', ready);
    el.removeEventListener('reveal:touched', touched);
    a?.removeEventListener('click', pickA);
    b?.removeEventListener('click', pickB);
    s?.removeEventListener('click', play);
    sw?.removeEventListener('change', onSw);
  };
}

/* ---------- marquee ---------- */
export function marquee(items) {
  const run = items.map((t, i) =>
    `<span class="mq-item${i % 3 === 2 ? ' ghost' : ''}">${esc(t)}</span>`).join('');
  return `<div class="mq" aria-hidden="true"><div class="mq-track">${run}${run}</div></div>`;
}
