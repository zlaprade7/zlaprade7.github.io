const io = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    const sibs = [...(e.target.parentElement?.children || [])].filter(c => c.classList.contains('rv') || c.classList.contains('wipe'));
    const i = Math.max(0, Math.min(sibs.indexOf(e.target), 3));
    e.target.style.transitionDelay = (i * 80) + 'ms';
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
document.querySelectorAll('.rv, .wipe').forEach(el => io.observe(el));

const nav = document.querySelector('nav');
let lastY = scrollY, ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    nav?.classList.toggle('stuck', y > 12);
    if (y > 140 && y > lastY) nav?.classList.add('hidden'); else nav?.classList.remove('hidden');
    lastY = y; ticking = false;
  });
}, { passive: true });

setTimeout(() => {
  document.querySelectorAll('.rv:not(.in), .wipe:not(.in)').forEach(el => {
    el.style.transitionDelay = '0ms'; el.classList.add('in');
  });
}, 2500);
