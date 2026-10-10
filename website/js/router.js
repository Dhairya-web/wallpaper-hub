/* ============================================================
   ROUTER — hash routing. Deep-links, survives a hard refresh
   with no server rewrite rules, and back/forward work natively.
   ============================================================ */

import { observeUp, resetUp, clearProgress, echoText, reduced, scroller } from './lib/motion.js';
import { markRoute } from './components/chrome.js';

export class Router {
  constructor(routes, outlet) {
    this.routes = routes; this.outlet = outlet;
    this.view = null; this.token = 0;
    addEventListener('hashchange', () => this.go());
    this.go(true);
  }

  static path() {
    const h = (location.hash || '#/').slice(1);
    return '/' + h.replace(/^\/+/, '').split('?')[0].replace(/\/+$/, '');
  }

  async go(first = false) {
    const path = Router.path();
    const def = this.routes[path] || this.routes['*'];
    const me = ++this.token;

    if (!first && !reduced()) {
      await this.shut();
      if (me !== this.token) return;   // a newer navigation owns the seam
    }

    this.view?.destroy?.();
    resetUp(); clearProgress();

    this.outlet.innerHTML = '<div class="view"></div>';
    const host = this.outlet.firstElementChild;

    scrollTo(0, 0);
    scroller()?.reset();
    markRoute(path);
    document.title = (def.title ? def.title + ' — ' : '') + 'Wallpaper Hub';

    this.view = (await def.render(host)) || null;
    if (me !== this.token) { this.view?.destroy?.(); return; }

    host.querySelectorAll('.echo').forEach(echoText);
    observeUp(host);
    if (!first) { this.open(); this.outlet.focus?.(); }
  }

  /* ---------- the seam ----------
     Kept on the router rather than in a component because it is a
     property of navigation, not of any page. Every path out of go()
     either opens it or hands ownership to a newer navigation, and
     the failsafe below means a thrown view can never leave a visitor
     staring at two closed panels. */
  get xr() { return this._xr ??= document.getElementById('xr'); }

  shut() {
    const x = this.xr;
    if (!x) return Promise.resolve();
    clearTimeout(this._fail); clearTimeout(this._done);
    x.classList.remove('opening');
    x.classList.add('armed');
    void x.offsetWidth;                 // commit the open position first
    x.classList.add('shut');
    this._fail = setTimeout(() => this.open(), 2600);

    /* Wait for the panels to actually meet, not for a number that
       ought to mean they have. A fixed 400ms wait was what let the
       swap happen in full view. The timeout below is a guarantee
       against a dropped transitionend, not the mechanism. */
    return new Promise(res => {
      const panel = x.querySelector('.xr-l');
      let done = false;
      const fin = () => {
        if (done) return;
        done = true;
        panel.removeEventListener('transitionend', fin);
        clearTimeout(cap); res();
      };
      const cap = setTimeout(fin, 760);
      panel.addEventListener('transitionend', fin);
    });
  }

  open() {
    const x = this.xr;
    if (!x || !x.classList.contains('shut')) return;
    clearTimeout(this._fail); clearTimeout(this._done);
    x.classList.add('opening');
    x.classList.remove('shut');
    this._done = setTimeout(() => x.classList.remove('armed', 'opening'), 660);
  }
}
