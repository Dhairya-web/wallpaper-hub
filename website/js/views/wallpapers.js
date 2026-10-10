/* ============================================================
   WALLPAPERS — the catalog, rendered entirely from the model.
   Each entry gets its own live stage; adding one to catalog.js
   is the only step needed.
   ============================================================ */
import { CATALOG } from '../data/catalog.js';
import { Reveal } from '../engine/reveal.js';
import { stage, wireStage, arw, esc } from './parts.js';

export default {
  title: 'Wallpapers',
  render(host) {
    host.innerHTML = `
    <section class="sec" style="padding-bottom:0">
      <div class="wrap ed">
        <p class="eye up" style="grid-column:1/13;grid-row:1">The catalog</p>
        <h1 class="echo page-h1" style="grid-column:1/9;grid-row:2;max-width:13ch">Two worlds, both real, one finished.</h1>
        <p class="lede hang up" data-s="1" style="grid-column:9/13;grid-row:2">
          Status is stated plainly on each piece. <strong style="color:var(--tx-hi)">Engine ready</strong> means it runs and is packaged.
          <strong style="color:var(--tx-hi)">In development</strong> means exactly that — shown here as work, not as stock.
        </p>
      </div>
    </section>

    ${CATALOG.map((w, i) => `
      <section class="sec ${i % 2 ? 'g2' : 'g1'}" ${i === 0 ? 'style="margin-top:clamp(3rem,8vw,6rem)"' : ''}>
        <div class="wrap">
          <div class="cat-head">
            <span class="chap-no">0${i + 1} — ${esc(w.origin)}</span>
            <span class="tag ${w.status === 'ready' ? 'tag-live' : 'tag-dev'}">${esc(w.statusLabel)}</span>
          </div>
          <h2 class="echo" style="max-width:14ch;margin-bottom:clamp(1.5rem,3.4vw,2.6rem)">${esc(w.title)}</h2>
        </div>
        <div class="bleed up">${stage(w, { id: `st${i}`, hint: w.status === 'ready' ? 'Drag across the artwork' : 'Development preview — drag to open' })}</div>
        <div class="wrap two" style="margin-top:clamp(2rem,5vw,3.5rem)">
          <div>
            <p class="dim" style="max-width:48ch">${esc(w.blurb)}</p>
            <p style="margin-top:1.5rem;font-size:var(--t-lg);color:var(--tx-hi);max-width:32ch">“${esc(w.lore)}”</p>
          </div>
          <dl class="dl" style="margin-top:0">
            <div><dt>Universe</dt><dd>${esc(w.universe)}</dd></div>
            <div><dt>Character</dt><dd>${esc(w.character)}</dd></div>
            <div><dt>States</dt><dd>${w.states.join(' · ')}</dd></div>
            <div><dt>Trails</dt><dd>${w.trails.join(' · ')}</dd></div>
            <div><dt>Living</dt><dd>${w.living.supported ? 'Supported' : 'Static only'}</dd></div>
            <div><dt>Targets</dt><dd>${w.targets.join(' · ')}</dd></div>
          </dl>
        </div>
      </section>`).join('')}

    <section class="sec">
      <div class="wrap" style="text-align:center">
        <p class="eye" style="justify-content:center">Not seeing it</p>
        <h2 class="echo" style="max-width:14ch;margin-inline:auto">Then it does not exist yet.</h2>
        <p class="dim up" data-s="1" style="max-width:46ch;margin:1.5rem auto 2.5rem">
          Which is the usual reason people commission one. Tell us the world and we will build the pair.
        </p>
        <a class="btn btn-cyan btn-lg" href="#/commissions">Start a brief ${arw()}</a>
      </div>
    </section>`;

    const engines = [], unbinds = [];
    CATALOG.forEach((w, i) => {
      const e = new Reveal({
        mount: host.querySelector(`#st${i}`),
        base: `assets/derived/${w.id}-base-1920.webp`,
        reveal: `assets/derived/${w.id}-reveal-1920.webp`,
        trail: w.trailId, theme: w.id,
        living: w.living.supported
      });
      engines.push(e);
      unbinds.push(wireStage(host, e, `st${i}`));
    });

    return { destroy() { unbinds.forEach(f => f()); engines.forEach(e => e.destroy()); } };
  }
};
