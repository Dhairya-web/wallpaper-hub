/* ============================================================
   ABOUT — the studio position. Short by design.
   ============================================================ */
import { CATALOG } from '../data/catalog.js';
import { arw, pic } from './parts.js';

export default {
  title: 'Studio',
  render(host) {
    host.innerHTML = `
    <section class="sec">
      <div class="wrap">
        <p class="eye up">The studio</p>
        <h1 class="echo big" style="font-size:clamp(2rem,6vw,4.6rem)">We make worlds you can keep on screen while you work.</h1>
        <div class="nums">
          ${[[String(CATALOG.length), 'Worlds built or in build'], ['2', 'States rendered per wallpaper'],
             ['0', 'Video loops used'], ['AI', 'Assisted implementation and artwork']]
            .map(([b, s], i) => `<div class="up" data-s="${i + 1}"><b>${b}</b><span>${s}</span></div>`).join('')}
        </div>
      </div>
    </section>

    <section class="sec g1" style="padding-top:0">
      <div class="wrap ed" style="padding-top:clamp(3rem,7vw,5rem)">
        <h2 class="echo h-chap cL cr1" style="max-width:12ch">What we are actually arguing.</h2>
        <div class="prose up cR cr1">
          <p class="dim">A desktop wallpaper is the most-looked-at image most people own, and almost nobody thinks about it. The two available options are a photograph that never changes, or a video loop that keeps moving whether or not you asked it to.</p>
          <p class="dim">There is a better answer in between. Draw a scene twice — once at rest, once transformed — and composite the second under the path of the cursor. It is there when you want it and completely quiet when you do not. That is the whole idea, and everything else here serves it.</p>
        </div>
      </div>

      <!-- The argument, made once, without a word: one frame, two
           states, split down a seam. This page had no artwork on it
           at all, which is a strange thing for a studio to hand over. -->
      <figure class="pair up" style="margin-top:clamp(3rem,7vw,5.5rem)">
        ${pic('aeren-sol', 'base', 'The same scene at rest on the left and transformed on the right, split down the middle', { sizes: '100vw', w: 1920 })}
        ${pic('aeren-sol', 'reveal', '', { cls: 'rv', sizes: '100vw', w: 1920 })}
        <i class="pair-seam" aria-hidden="true"></i>
        <figcaption><span>Resting</span><span>Riftborne Ascendant</span></figcaption>
      </figure>
    </section>

    <section class="sec">
      <div class="wrap">
        <p class="eye eye-gold up">How we work</p>
        <h2 class="echo h-chap" style="max-width:12ch">Four commitments.</h2>
        <div class="tenets">
          ${[['Original worlds first', 'Rift Garden and The Ash Meridian are original-world development concepts created with AI assistance. The One Piece piece is an unofficial fan study, not a claim of ownership of the characters.'],
             ['Restraint over spectacle', 'Anything that moves has to earn it. We rejected physical wind, hair and fabric motion because we could not do them without the artwork breaking, and shipping a broken version was not an option.'],
             ['Say what is finished', 'Every piece carries its real status. Work in development is shown as work in development, including the flagship.'],
             ['Clear about the process', 'Dhairya Lukha directed and reviewed this personal project. AI assisted with implementation and artwork. This is a portfolio prototype, not evidence of paid client work.']]
            .map(([h, p], i) => `
              <article class="tenet up" data-s="${(i % 3) + 1}">
                <span>0${i + 1}</span>
                <div><h4>${h}</h4><p>${p}</p></div>
              </article>`).join('')}
        </div>
      </div>
    </section>

    <section class="sec g4">
      <div class="wrap" style="text-align:center">
        <h2 class="echo" style="max-width:16ch;margin-inline:auto">Tell us what you want to look at.</h2>
        <p class="dim up" data-s="1" style="max-width:44ch;margin:1.5rem auto 2.5rem">
          Try the six-step brief-building interface. It is a frontend demonstration only; no orders are accepted and nothing is transmitted.
        </p>
        <div class="hero-cta" style="justify-content:center">
          <a class="btn btn-cyan btn-lg" href="#/commissions">Start a brief ${arw()}</a>
          <a class="btn btn-line btn-lg" href="#/aeren-sol">See the flagship</a>
        </div>
      </div>
    </section>`;
  }
};
