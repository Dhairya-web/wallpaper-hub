/* ============================================================
   COMMISSIONS — the funnel.
   Proves the commercial UX only: no payment, no accounts, no
   uploads. It terminates in a structured brief. Wiring it to a
   real inbox is one function.
   ============================================================ */
import { arw, esc } from './parts.js';
import { magnet } from '../lib/motion.js';

const STEPS = ['Subject', 'Source', 'Mood', 'Format', 'Brief', 'Send'];
const OPTS = {
  subject: [['A character', 'Original, or one you love'], ['A place', 'Real, remembered or invented'],
            ['A machine', 'Car, bike, rig, ship'], ['A companion', 'Pet or animal'],
            ['A moment', 'A screenshot or photo worth keeping'], ['Something else', 'Describe it and we will tell you']],
  source:  [['Photographs', 'One good reference is usually enough'], ['A screenshot', 'From a game or a film'],
            ['Existing artwork', 'Yours, or licensed to you'], ['A moodboard', 'References and a direction'],
            ['Words only', 'No image — we build from the description']],
  mood:    [['Cinematic', 'Wide, atmospheric, deep contrast'], ['Science fantasy', 'Like the Rift Garden'],
            ['Neon', 'Saturated, nocturnal, city light'], ['Painterly', 'Softer edges, visible hand'],
            ['Clean and quiet', 'Minimal, low noise, calm'], ['Your judgement', 'We propose the direction']],
  format:  [['3840 × 2160', '4K, single display'], ['2560 × 1440', 'Common desktop'],
            ['1920 × 1080', 'Full HD'], ['Ultrawide', '3440 × 1440 or wider'],
            ['Multi-monitor', 'Tell us the arrangement'], ['Not sure yet', 'We will ask before starting']]
};

export default {
  title: 'Commissions',
  render(host) {
    const S = { subject: '', source: '', mood: '', format: '', notes: '' };
    let step = 0, moved = false, capturedBrief = null;

    const tiles = k => `<div class="tiles" role="group" aria-label="${k}">
      ${OPTS[k].map(([t, d]) => `<button class="tile" type="button" data-k="${k}" data-v="${esc(t)}" aria-pressed="false"><b>${esc(t)}</b>${esc(d)}</button>`).join('')}
    </div>`;

    host.innerHTML = `
    <section class="sec" style="padding-bottom:0">
      <div class="wrap ed">
        <p class="eye eye-gold up" style="grid-column:1/13;grid-row:1">Studio commissions</p>
        <h1 class="echo page-h1" style="grid-column:1/8;grid-row:2;max-width:11ch">Your world. Your idea.</h1>
        <p class="lede hang up" data-s="2" style="grid-column:8/13;grid-row:2">
          Six short questions demonstrate a brief-building flow. This portfolio prototype sends nothing and does not accept orders. Use sample details only.
        </p>
        <p class="price price-fig up" data-s="1" style="grid-column:1/6;grid-row:3">
          <span>Interface demo</span>6<em>steps · no live commissions</em>
        </p>
      </div>
    </section>

    <section class="sec">
      <div class="wrap">
        <div class="steps" role="tablist" aria-label="Commission steps">
          ${STEPS.map((s, i) => `<button class="step-tab" role="tab" data-i="${i}" ${i === 0 ? 'aria-current="step"' : ''}>${i + 1} · ${s}</button>`).join('')}
        </div>

        <div id="panes">
          <div class="pane on" role="tabpanel">
            <h3>What do you want to bring to life?</h3>
            <p>The single thing the wallpaper is about.</p>${tiles('subject')}
          </div>
          <div class="pane" role="tabpanel">
            <h3>What are you giving us to work from?</h3>
            <p>We can work from very little. We just need to know which.</p>${tiles('source')}
          </div>
          <div class="pane" role="tabpanel">
            <h3>How should it feel?</h3>
            <p>Direction matters more than detail at this stage.</p>${tiles('mood')}
          </div>
          <div class="pane" role="tabpanel">
            <h3>What are you running it on?</h3>
            <p>We build the pair to your display so nothing is cropped away.</p>${tiles('format')}
          </div>
          <div class="pane" role="tabpanel">
            <h3>Tell us the idea.</h3>
            <p>What should the resting state show, and what should appear when the cursor passes over it? That second answer is the interesting one.</p>
            <label class="fld"><span>The brief</span>
              <textarea id="notes" placeholder="At rest it is my car parked under sodium lights in the rain. Moving across it turns the street into the same shot at dawn, empty, no rain."></textarea>
            </label>
          </div>
          <div class="pane" role="tabpanel">
            <h3>Review the sample brief.</h3>
            <p>Use fictional contact details. Nothing entered here is transmitted or submitted.</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(15rem,100%),1fr));gap:1.5rem">
              <label class="fld"><span>Name</span><input id="cn" type="text" autocomplete="name" placeholder="How should we address you"></label>
              <label class="fld"><span>Email or handle</span><input id="cc" type="text" autocomplete="email" placeholder="you@example.com"></label>
            </div>
            <h4 style="margin:2.5rem 0 1.25rem">Your brief</h4>
            <dl class="sum" id="sum"></dl>
            <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
              <button class="btn btn-cyan btn-lg" id="send" type="button">Preview brief ${arw()}</button>
              <button class="btn btn-bare" id="copy" type="button">Copy as text</button>
            </div>
            <p class="mono" style="margin-top:1.5rem">Prototype — this does not transmit anywhere yet</p>
          </div>
        </div>

        <div class="step-nav">
          <button class="btn btn-bare" id="back" type="button" aria-disabled="true">← Back</button>
          <button class="btn btn-fill" id="next" type="button">Continue ${arw()}</button>
        </div>
      </div>
    </section>`;

    const q = s => host.querySelector(s);
    const tabs = [...host.querySelectorAll('.step-tab')];
    const panes = [...host.querySelectorAll('.pane')];
    const back = q('#back'), next = q('#next');

    const sum = () => {
      S.notes = q('#notes').value.trim();
      q('#sum').innerHTML = [['Subject', S.subject], ['Source material', S.source], ['Mood', S.mood],
        ['Format', S.format], ['Brief', S.notes]]
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v || 'Not chosen')}</dd></div>`).join('');
    };
    const paint = () => {
      panes.forEach((p, i) => p.classList.toggle('on', i === step));
      tabs.forEach((t, i) => {
        i === step ? t.setAttribute('aria-current', 'step') : t.removeAttribute('aria-current');
        t.classList.toggle('done', i < step);
      });
      back.setAttribute('aria-disabled', String(step === 0));
      next.style.display = step === STEPS.length - 1 ? 'none' : '';
      if (step === STEPS.length - 1) sum();
      if (moved) q('#panes').scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    };

    const onTile = e => {
      const b = e.currentTarget, k = b.dataset.k;
      host.querySelectorAll(`.tile[data-k="${k}"]`).forEach(t => t.setAttribute('aria-pressed', String(t === b)));
      S[k] = b.dataset.v;
      if (step < 3) setTimeout(() => { moved = true; step++; paint(); }, 240);
    };
    host.querySelectorAll('.tile').forEach(t => t.addEventListener('click', onTile));

    const go = d => { moved = true; step = Math.min(Math.max(step + d, 0), STEPS.length - 1); paint(); };
    const onNext = () => go(1), onBack = () => go(-1);
    const onTab = e => { moved = true; step = +e.currentTarget.dataset.i; paint(); };
    next.addEventListener('click', onNext);
    back.addEventListener('click', onBack);
    tabs.forEach(t => t.addEventListener('click', onTab));

    const text = () => { sum(); return `WALLPAPER HUB — COMMISSION BRIEF
Subject: ${S.subject || '—'}
Source:  ${S.source || '—'}
Mood:    ${S.mood || '—'}
Format:  ${S.format || '—'}
Name:    ${q('#cn').value.trim() || '—'}
Contact: ${q('#cc').value.trim() || '—'}

Brief:
${S.notes || '—'}`; };

    const copyTo = async btn => {
      const was = btn.textContent;
      try { await navigator.clipboard.writeText(capturedBrief ?? text()); btn.textContent = 'Copied'; }
      catch { btn.textContent = 'Copy failed'; }
      setTimeout(() => { btn.textContent = was; }, 1800);
    };
    const onCopy = e => copyTo(e.currentTarget);
    q('#copy').addEventListener('click', onCopy);

    const onSend = () => {
      capturedBrief = text();
      q('#panes').innerHTML = `
        <div class="sent">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
          <h3 style="margin-bottom:1rem">Brief preview ready</h3>
          <p class="dim" style="max-width:44ch;margin:0 auto 2.5rem">
            This is the final screen of the prototype. Nothing has been sent or saved to a server.
            You can copy the sample brief to see the structured output.
          </p>
          <div class="hero-cta" style="justify-content:center">
            <button class="btn btn-line" id="copy2" type="button">Copy brief as text</button>
            <a class="btn btn-cyan" href="#/wallpapers">Browse the catalog ${arw()}</a>
          </div>
        </div>`;
      host.querySelector('.steps').style.display = 'none';
      host.querySelector('.step-nav').style.display = 'none';
      host.querySelector('#copy2').addEventListener('click', e => copyTo(e.currentTarget));
    };
    q('#send').addEventListener('click', onSend);

    const unm = magnet(next, 0.14);
    paint();

    return {
      destroy() {
        unm();
        host.querySelectorAll('.tile').forEach(t => t.removeEventListener('click', onTile));
        tabs.forEach(t => t.removeEventListener('click', onTab));
      }
    };
  }
};
