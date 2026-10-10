/* ============================================================
   HOME — four beats.

     1  HERO            what this is
     2  TRANSFORMATION  the argument, made while it is demonstrated
     3  THE WORK        try it, then see what exists
     4  COMMISSION      one way in

   The V2 eight-section cut is kept at _archive/home-v2-8beat.js.
   The premise no longer gets its own section: "a poster never
   changes" and "a loop never stops" are claims better made
   underneath the thing that proves them, so they moved into the
   scroll captions. Living/Static lost its section too — it is a
   property of each piece, so it sits in the catalog facts and is
   demonstrated properly on the dossier.
   ============================================================ */

import { CATALOG, byId, MARQUEE } from '../data/catalog.js';
import { Reveal } from '../engine/reveal.js';
import { magnet, trackProgress, clamp, reduced } from '../lib/motion.js';
import { stage, wireStage, marquee, pic, arw, esc } from './parts.js';

/* Each caption carries one mechanic and one argument. */
const STEPS = [
  ['A poster never changes',
   'It sits unread for months and you stop seeing it inside a week. This is the resting state — still until you move.'],
  ['The meridian opens',
   'Move across it and the second state composites into the first along a near-solid mask.'],
  ['Riftborne Ascendant',
   'Both states are one composition, so the transformation lands exactly where the resting form was.'],
  ['A loop never stops. This does',
   'Decay is time based. The scene closes on its own rather than waiting for you to come back.']
];

export default {
  title: 'Worlds you can live with',
  render(host) {
    const SECOND = byId('luffy');

    host.innerHTML = `
    <!-- 1 ─ HERO : type dominates the frame; support copy is placed, not stacked -->
    <section class="hero">
      <div class="hero-art" id="heroArt">
        ${pic('aeren-sol', 'base', 'Aeren Sol at rest in the Rift Garden', { sizes: '100vw', eager: true })}
      </div>
      <div class="rift" aria-hidden="true">
        <span class="rift-l"></span><span class="rift-r"></span><span class="rift-seam"></span>
      </div>
      <div class="wrap hero-in ed">
        <p class="marg c1-13" style="grid-column:1/4">Wallpaper Hub<b>Interactive studio</b></p>
        <h1 class="echo c1-13" style="grid-column:1/9">Your screen<br>is not<br>a poster.</h1>
        <div class="c1-13 drop" style="grid-column:1/6">
          <div class="hero-cta up" data-s="2">
            <a class="btn btn-fill btn-lg" href="#/aeren-sol" data-cur="OPEN">Enter Rift Garden ${arw()}</a>
            <a class="btn btn-line btn-lg" href="#/commissions">Try the brief demo</a>
          </div>
        </div>
        <p class="support up c1-13 drop" data-s="1" style="grid-column:8/13">
          One scene rendered twice and composited live. Move across it and the second state surfaces under your hand.
        </p>
      </div>
      <p class="hero-scroll"><i></i>Scroll</p>
    </section>

    ${marquee(MARQUEE)}

    <!-- 2 ─ TRANSFORMATION : the argument runs in the captions -->
    <section class="scroll-tell g2" id="tell">
      <div class="scroll-pin">
        <div class="scroll-stage" id="tellStage"></div>
        <div class="scroll-cap">
          <div class="wrap">
            <div>
              ${STEPS.map((s, i) => `
                <div class="scroll-step${i === 0 ? ' on' : ''}" data-step="${i}"
                     style="${i ? 'position:absolute;bottom:0' : ''}">
                  <h3>${esc(s[0])}</h3><p>${esc(s[1])}</p>
                </div>`).join('')}
            </div>
            <div class="scroll-prog"><i id="tellProg"></i></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3 ─ THE WORK : headline overlaps the media it introduces -->
    <section class="sec sec-tight g1">
      <div class="wrap ed beat-head">
        <p class="marg r1" style="grid-column:1/6;padding-top:0">03<b>The work</b></p>
        <h2 class="echo r2" style="grid-column:1/9">Two worlds.<br>Two trails.</h2>
        <p class="support r2 hang" style="grid-column:9/13">
          Aeren carries the <strong>Starbloom Comet</strong>. Onigashima gets the <strong>Gear Pi Cloud</strong> — rounded awakening cloudwork with a lavender shadow. Same engine, same two-state idea, different signature.
        </p>
      </div>

      <div class="bleed under up" data-s="1">${stage(SECOND)}</div>

      <div class="wrap" style="margin-top:clamp(3rem,8vw,6rem)">

        ${CATALOG.map((w, i) => `
          <article class="row up" data-s="${i + 1}">
            <div class="row-media">
              ${pic(w.id, 'base', `${w.title}, resting state`, { sizes: '(max-width:900px) 92vw, 55vw', w: 1280 })}
              ${pic(w.id, 'reveal', '', { cls: 'rv', sizes: '(max-width:900px) 92vw, 55vw', w: 1280 })}
            </div>
            <div>
              <span class="row-no">0${i + 1} — ${esc(w.origin)}</span>
              <h3>${esc(w.title)}</h3>
              <p>${esc(w.blurb)}</p>
              <dl class="row-facts">
                <div><dt>States</dt><dd>${w.states.join(' · ')}</dd></div>
                <div><dt>Trail</dt><dd>${esc(w.trail)}</dd></div>
                <div><dt>Motion</dt><dd>${w.living.supported ? 'Living + Static' : 'Static only'}</dd></div>
                <div><dt>Status</dt><dd><span class="tag ${w.status === 'ready' ? 'tag-live' : 'tag-dev'}">${esc(w.statusLabel)}</span></dd></div>
              </dl>
              <a class="btn btn-line row-link" href="#${w.id === 'aeren-sol' ? '/aeren-sol' : '/wallpapers'}" data-cur="OPEN">
                ${w.id === 'aeren-sol' ? 'Open the dossier' : 'See the detail'} ${arw()}
              </a>
            </div>
          </article>`).join('')}
      </div>
    </section>

    <!-- 4 ─ COMMISSION : inverted — facts left in the margin, statement right -->
    <section class="sec sec-open g4 comm">
      <div class="wrap ed comm-grid">
        <p class="marg cr1 cL" style="padding-top:0">04<b>Commissions</b></p>
        <h2 class="echo cr1 cR">Your world.<br>Your idea.</h2>

        <p class="price price-fig up cr2 cL" data-s="1"><span>Portfolio</span>Demo</p>
        <p class="support up cr2 cR" data-s="2" style="max-width:44ch">
          A prototype brief-building flow for exploring an interactive wallpaper idea. Try the interface with fictional details. This portfolio preview does not accept orders, payments or submissions.
        </p>

        <dl class="give up cr3 cR" data-s="3">
          ${[['Photographs','One good reference is enough'],
             ['A screenshot','From a game or a film'],
             ['Artwork','Yours, or licensed to you'],
             ['Words only','No image at all']]
            .map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}
        </dl>
        <div class="up comm-cta cr3 cL" data-s="4">
          <a class="btn btn-cyan btn-lg" href="#/commissions" id="commCta">Start a brief ${arw()}</a>
        </div>
      </div>
    </section>`;



    /* --- hands-on stage: the second world, running Gear Pi --- */
    const engine = new Reveal({
      mount: host.querySelector('#stage'),
      base: `assets/derived/${SECOND.id}-base-1920.webp`,
      reveal: `assets/derived/${SECOND.id}-reveal-1920.webp`,
      trail: SECOND.trailId, theme: SECOND.id,
      living: SECOND.living.supported
    });
    const un = wireStage(host, engine);

    /* --- scroll-driven transformation --- */
    const tell = new Reveal({
      mount: host.querySelector('#tellStage'),
      base: `assets/derived/aeren-sol-base-1920.webp`,
      reveal: `assets/derived/aeren-sol-reveal-1920.webp`,
      trail: 'starbloom', theme: 'aeren-sol',
      living: false
    });
    const prog = host.querySelector('#tellProg');
    const steps = [...host.querySelectorAll('.scroll-step')];
    trackProgress(host.querySelector('#tell'), p => {
      tell.setWipe(clamp((p - 0.08) / 0.78, 0, 1));
      if (prog) prog.style.transform = `scaleX(${p.toFixed(3)})`;
      const i = p < .22 ? 0 : p < .52 ? 1 : p < .86 ? 2 : 3;
      steps.forEach((s, k) => s.classList.toggle('on', k === i));
    });

    /* --- the hero IS the demo ---------------------------------
       The headline claims your screen is not a poster, so the hero
       must not be one. The real Starbloom engine runs behind the
       type: move across it and the Ascendant state surfaces, exactly
       as it will on a desktop.

       Constructed after load, never during it. The <img> underneath
       is still the LCP element and still paints on the first frame;
       the canvas costs 317KB for the second state and has no business
       competing with first paint for it. It fades in when ready. */
    const heroArt = host.querySelector('#heroArt');
    let hero = null, showTimer = null;
    const idle = window.requestIdleCallback || (f => setTimeout(f, 300));
    let heroTimer = idle(() => {
      if (!heroArt.isConnected) return;
      hero = new Reveal({
        mount: heroArt,
        base: 'assets/derived/aeren-sol-base-1920.webp',
        reveal: 'assets/derived/aeren-sol-reveal-1920.webp',
        trail: 'starbloom', theme: 'aeren-sol',
        /* No living atmosphere here. Measured in this container it cost
           39fps — 60 down to 21 — because `living` pins a rAF loop open
           forever and repaints a full-viewport canvas every frame for
           particles nobody can see at that scale. Without it the hero
           sleeps until a pointer touches it, which is the whole point.
           The atmosphere is demonstrated properly on the dossier, where
           there is a toggle and a 16:9 frame to see it in. */
        living: false,
        dprCap: 1.35
      });
      let touched = false;
      heroArt.addEventListener('reveal:touched', () => {
        touched = true;
        host.querySelector('.hero')?.classList.add('touched');
      }, { once: true });

      /* One unprompted pass, once, and only if nobody has already
         found it. A surface that never moves is a surface nobody
         tries — and the decay afterwards is half the argument, so
         the demonstration has to include the scene closing itself. */
      heroArt.addEventListener('reveal:ready', () => {
        heroArt.classList.add('live');
        if (reduced()) return;
        showTimer = setTimeout(() => { if (!touched) hero?.sweep(); }, 1500);
      }, { once: true });
    });

    const unm = [magnet(host.querySelector('#commCta'), 0.16)];

    return { destroy() {
      un(); unm.forEach(f => f());
      (window.cancelIdleCallback || clearTimeout)(heroTimer);
      clearTimeout(showTimer);
      hero?.destroy(); engine.destroy(); tell.destroy();
    } };
  }
};
