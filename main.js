/* ---------- scroll reveal (staggered, capped) ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const group = entry.target.parentElement;
    const sibs  = group ? [...group.children].filter(c => c.classList.contains('rv') || c.classList.contains('wipe')) : [];
    const i     = Math.min(sibs.indexOf(entry.target), 3); // cap the stagger so it never feels slow
    entry.target.style.transitionDelay = (i > 0 ? i * 90 : 0) + 'ms';
    entry.target.classList.add('in');
    io.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.rv, .wipe').forEach(el => io.observe(el));

/* ---------- nav: hide on scroll down, show on scroll up ---------- */
const nav = document.querySelector('nav');
let lastY = window.scrollY;
let ticking = false;

function onScroll() {
  const y = window.scrollY;

  if (nav) {
    nav.classList.toggle('stuck', y > 12);
    if (y > 140 && y > lastY) nav.classList.add('hidden');
    else nav.classList.remove('hidden');
  }

  const bar = document.querySelector('.progress');
  if (bar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  }

  lastY = y;
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
}, { passive: true });

/* ---------- graceful image placeholders ----------
   Any .fig whose <img> fails to load shows its data-ph note instead,
   so the site looks intentional before every photo is in place.       */
document.querySelectorAll('.fig img').forEach(img => {
  const mark = () => img.closest('.fig')?.classList.add('missing');
  img.addEventListener('error', mark);
  if (img.complete && img.naturalWidth === 0) mark();
});
