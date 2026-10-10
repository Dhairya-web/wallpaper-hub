/* ============================================================
   BOOT
   ============================================================ */
import { Router } from './router.js';
import { mountChrome } from './components/chrome.js';
import { smoothScroll, reduced } from './lib/motion.js';

import home from './views/home.js';
import aeren from './views/aeren.js';
import wallpapers from './views/wallpapers.js';
import commissions from './views/commissions.js';
import journal from './views/journal.js';
import about from './views/about.js';

mountChrome();
smoothScroll();                       // no-op under reduced motion or on touch
new Router({
  '/': home, '/aeren-sol': aeren, '/wallpapers': wallpapers,
  '/commissions': commissions, '/journal': journal, '/about': about, '*': home
}, document.getElementById('main'));

/* Lift the veil once the first paint settles. The timeout is a
   guarantee, not the mechanism — the page is never trapped. */
const veil = document.getElementById('veil');
const up = () => veil.classList.add('up');
if (reduced()) up();
else addEventListener('load', () => setTimeout(up, 380), { once: true });
setTimeout(up, 2600);
