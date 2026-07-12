/* reveal on scroll, staggered by position within a group */
const io = new IntersectionObserver((es) => {
  es.forEach((e) => {
    if (!e.isIntersecting) return;
    const sibs = [...(e.target.parentElement?.children || [])].filter(c => c.classList.contains('rv'));
    const i = Math.max(0, Math.min(sibs.indexOf(e.target), 4));
    e.target.style.transitionDelay = (i * 60) + 'ms';
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* hairline under nav once you scroll */
const nav = document.querySelector('nav');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    nav?.classList.toggle('stuck', scrollY > 8);
    ticking = false;
  });
}, { passive: true });

/* safety net: nothing stays invisible because an animation didn't fire */
setTimeout(() => {
  document.querySelectorAll('.rv:not(.in)').forEach(el => {
    el.style.transitionDelay = '0ms';
    el.classList.add('in');
  });
}, 2200);
