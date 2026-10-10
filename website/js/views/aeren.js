/* ============================================================
   AEREN SOL — a world dossier, not a product page.
   ============================================================ */
import { FLAGSHIP as A } from '../data/catalog.js';
import { Reveal } from '../engine/reveal.js';
import { parallax } from '../lib/motion.js';
import { stage, wireStage, pic, arw, esc } from './parts.js';

export default {
  title: 'Aeren Sol',
  render(host) {
    host.innerHTML = `
    <section class="dh">
      <div class="dh-art"><div id="dhImg" style="width:100%;height:100%">
        ${pic('aeren-sol', 'base', '', { sizes: '100vw', eager: true })}
      </div></div>
      <div class="wrap dh-in">
        <span class="tag tag-dev">Development preview · not for sale</span>
        <h1 class="echo">Aeren Sol</h1>
        <p class="dh-sub up" data-s="1">${esc(A.kicker)} — carrying a living starseed through a plaza that has been dark for an age.</p>
      </div>
    </section>

    <div class="wrap">
      <section class="chap">
        <span class="chap-no">01 — The character</span>
        <div class="two">
          <div>
            <h2 class="echo" style="max-width:12ch">A protagonist who repairs.</h2>
            <div class="prose up" data-s="1" style="margin-top:1.75rem">
              <p class="dim">Aeren is not a soldier and does not win anything. The starseed carried at the chest germinates dormant worlds, pulling light, growth and memory back into places that stopped some time ago.</p>
              <p class="dim">The cost is the story. Restoring one history appears to overwrite another version of the same place, and Aeren has no reliable way to know which one is being erased.</p>
            </div>
          </div>
          <figure class="fig up" data-s="1">
            ${pic('aeren-sol', 'base', 'Aeren Sol at rest in the Rift Garden plaza', { sizes: '(max-width:900px) 92vw, 46vw', w: 1280 })}
          </figure>
        </div>
        <dl class="dl up" data-s="2">
          <div><dt>World</dt><dd>${esc(A.world)}</dd></div>
          <div><dt>Universe</dt><dd>${esc(A.universe)}</dd></div>
          <div><dt>States</dt><dd>${A.states.join(' · ')}</dd></div>
          <div><dt>Origin</dt><dd>${esc(A.origin)}</dd></div>
        </dl>
      </section>

      <section class="chap">
        <span class="chap-no">02 — The Ash Meridian</span>
        <div class="two">
          <figure class="fig up">
            ${pic('aeren-sol', 'reveal', 'The Riftborne Ascendant state, the plaza lit by rift light', { sizes: '(max-width:900px) 92vw, 46vw', w: 1280 })}
          </figure>
          <div>
            <h2 class="echo" style="max-width:14ch">Where the artificial suns collapsed.</h2>
            <div class="prose up" data-s="1" style="margin-top:1.75rem">
              <p class="dim">The Meridian was a lattice of engineered suns strung between inhabited worlds. When it failed the worlds did not burn — they stopped, holding the shape of the last ordinary afternoon.</p>
              <p class="dim">What is left overlaps. Two versions of the same street can occupy the same ground, and walking through one thins the other.</p>
            </div>
            <p class="up" data-s="2" style="margin-top:2rem;font-size:var(--t-lg);color:var(--tx-hi);max-width:34ch">“${esc(A.lore)}”</p>
          </div>
        </div>
      </section>
    </div>

    <section class="chap g2" style="border:0">
      <div class="wrap">
        <span class="chap-no">03 — The transformation</span>
        <h2 class="echo" style="max-width:14ch;margin-bottom:2.5rem">Drag to open the meridian.</h2>
      </div>
      <div class="bleed up">${stage(A)}</div>
    </section>

    <div class="wrap">
      <section class="chap">
        <span class="chap-no">04 — Living and Static</span>
        <div class="two">
          <div>
            <h2 class="echo" style="max-width:14ch">Two ways to keep it on screen.</h2>
            <div class="prose up" data-s="1" style="margin-top:1.75rem">
              <p class="dim"><strong style="color:var(--tx-hi)">Living</strong> holds a restrained atmosphere over the resting scene and a rigid whole-scene parallax that shifts with the pointer. Nothing inside the artwork deforms.</p>
              <p class="dim"><strong style="color:var(--tx-hi)">Static</strong> removes the atmosphere and the parallax and keeps the reveal. It is the quieter option, and the cheaper one.</p>
            </div>
          </div>
          <div>
            <ul class="live-list up" data-s="1" style="margin-top:0">
              ${A.living.atmosphere.map(([a, b]) => `<li>${esc(a)}<span>${esc(b)}</span></li>`).join('')}
            </ul>
            <div class="live-ctl up" data-s="2">
              <div><strong style="color:var(--tx-hi)">Living atmosphere</strong>
                <span class="dim" style="display:block;font-size:.86rem">Drives the canvas above</span></div>
              <label class="sw"><input type="checkbox" id="liveSw" checked><i></i><span class="sr">Toggle living atmosphere</span></label>
            </div>
          </div>
        </div>
        <dl class="dl up" data-s="2">
          <div><dt>Signature trail</dt><dd>${esc(A.trail)}</dd></div>
          <div><dt>Fallback</dt><dd>Minimal Reveal</dd></div>
          <div><dt>Decay</dt><dd>Time based</dd></div>
          <div><dt>Deformation</dt><dd>Disabled by design</dd></div>
          <div><dt>Resolutions</dt><dd>${A.resolutions.join(' · ')}</dd></div>
          <div><dt>Targets</dt><dd>${A.targets.join(' · ')}</dd></div>
        </dl>
      </section>

      <section class="chap">
        <span class="chap-no">05 — Where it stands</span>
        <div class="two">
          <div>
            <h2 class="echo" style="max-width:10ch">Honest status.</h2>
            <div class="prose up" data-s="1" style="margin-top:1.75rem">
              <p class="dim">Aeren Sol is the studio's flagship and is not finished. The artwork on this page is a staging candidate shown for development purposes. It is not packaged, not released, and not for sale.</p>
            </div>
            <p class="note up" data-s="2">Availability, naming and any commercial use remain subject to review. Nothing on this page constitutes an offer to sell.</p>
          </div>
          <div class="up" data-s="1">
            <h4 style="margin-bottom:1.25rem">Release gates</h4>
            <div class="gates">
              ${A.gates.map(([g, ok]) => `
                <div class="gate ${ok ? 'ok' : 'open'}"><i>${ok ? 'Passed' : 'Open'}</i><b>${esc(g)}</b></div>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <section class="chap" style="text-align:center">
        <h2 class="echo" style="max-width:16ch;margin-inline:auto">Want something like this, but yours?</h2>
        <div class="hero-cta up" data-s="1" style="justify-content:center;margin-top:2.5rem">
          <a class="btn btn-cyan btn-lg" href="#/commissions">Start a brief ${arw()}</a>
          <a class="btn btn-line btn-lg" href="#/wallpapers">See the catalog</a>
        </div>
      </section>
    </div>`;

    const engine = new Reveal({
      mount: host.querySelector('#stage'),
      base: 'assets/derived/aeren-sol-base-1920.webp',
      reveal: 'assets/derived/aeren-sol-reveal-1920.webp',
      trail: 'starbloom', theme: 'aeren-sol',
      living: true
    });
    const un = wireStage(host, engine);
    parallax(host.querySelector('#dhImg'), 0.1, 1.16);
    return { destroy() { un(); engine.destroy(); } };
  }
};
