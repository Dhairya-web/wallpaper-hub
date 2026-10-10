/* ============================================================
   JOURNAL — public creative writing only.
   ============================================================ */
import { POSTS, KINDS } from '../data/journal.js';
import { arw, esc } from './parts.js';
import { observeUp } from '../lib/motion.js';

const nice = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default {
  title: 'Journal',
  render(host) {
    host.innerHTML = `
    <section class="sec">
      <div class="wrap ed">
        <p class="eye up" style="grid-column:1/13;grid-row:1">Journal</p>
        <h1 class="echo page-h1" style="grid-column:1/9;grid-row:2;max-width:15ch">Worldbuilding, craft notes and studio process.</h1>
        <p class="lede hang up" data-s="1" style="grid-column:9/13;grid-row:2">
          What we are writing, what we are building, and the decisions behind both. Engineering detail that belongs in the workshop stays in the workshop.
        </p>
      </div>
      <div class="wrap">
        <div class="steps up" data-s="2" role="group" aria-label="Filter by topic" style="margin-top:clamp(2.5rem,6vw,4rem)">
          ${KINDS.map((k, i) => `<button class="step-tab" data-k="${esc(k)}" ${i === 0 ? 'aria-current="step"' : ''}>${esc(k)}</button>`).join('')}
        </div>

        <div id="posts" style="margin-top:1rem">
          ${POSTS.map((p, i) => `
            <article class="post up" data-s="${(i % 3) + 1}" data-k="${esc(p.kind)}">
              <p class="post-d">${nice(p.date)}<br><span style="color:var(--cyan)">${esc(p.kind)}</span></p>
              <div><h3>${esc(p.title)}</h3><p>${esc(p.excerpt)}</p></div>
              <span class="post-go">${arw(18)}</span>
            </article>`).join('')}
        </div>
        <p class="mono" id="empty" hidden style="padding:4rem 0;text-align:center">Nothing filed under this topic yet</p>
        <p class="mono" style="margin-top:2.5rem">Individual entries are not published in this prototype</p>
      </div>
    </section>`;

    const tabs = [...host.querySelectorAll('.step-tab')];
    const posts = [...host.querySelectorAll('.post')];
    const empty = host.querySelector('#empty');
    const onTab = e => {
      const k = e.currentTarget.dataset.k;
      tabs.forEach(t => t === e.currentTarget ? t.setAttribute('aria-current', 'step') : t.removeAttribute('aria-current'));
      let n = 0;
      posts.forEach(p => {
        const on = k === 'All' || p.dataset.k === k;
        p.style.display = on ? '' : 'none';
        if (on) { n++; p.classList.remove('on'); }
      });
      empty.hidden = n > 0;
      observeUp(host);
    };
    tabs.forEach(t => t.addEventListener('click', onTab));
    return { destroy() { tabs.forEach(t => t.removeEventListener('click', onTab)); } };
  }
};
