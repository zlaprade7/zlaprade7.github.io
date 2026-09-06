document.documentElement.classList.add('js');
const bar=document.getElementById('bar'),nav=document.getElementById('nav');
addEventListener('scroll',()=>{
  const h=document.documentElement;
  if(bar)bar.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  if(nav&&nav.dataset.solidAfter)nav.classList.toggle('solid',h.scrollTop>innerHeight*parseFloat(nav.dataset.solidAfter));
},{passive:true});
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
  }),{threshold:.15});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
}else{
  document.querySelectorAll('.rv').forEach(el=>el.classList.add('in'));
}
// a photo that isn't in the repo yet should read as a pending placeholder,
// not a broken-image icon
document.querySelectorAll('img[src*="images/"]').forEach(img=>{
  const swap=()=>{
    const ph=document.createElement('div');
    ph.className='imgph';
    ph.textContent='[ '+(img.alt||'photo').toUpperCase()+' — PHOTO PENDING ]';
    img.replaceWith(ph);
  };
  if(img.complete&&img.naturalWidth===0)swap();
  img.addEventListener('error',swap);
});

// safety: never leave content hidden
setTimeout(()=>document.querySelectorAll('.rv:not(.in)').forEach(el=>{
  if(el.getBoundingClientRect().top<innerHeight)el.classList.add('in');
}),1500);

/* Hover magnifier on board photos. A four-layer board at 573px of column is
   unreadable — you cannot make out silkscreen or part numbers — so the
   detail-dense figures get a lens. Mouse only: on a touch screen there is no
   hover, and pinch-zoom already does this job.

   The maths has to emulate `object-fit:cover`, which is what `.frame img`
   uses. Scaling the background to the box's own aspect instead would stretch
   the zoomed view whenever the photo is not 4:3, which none of them are. */
document.querySelectorAll('.frame[data-lens]').forEach(box=>{
  const img = box.querySelector('img');
  if(!img) return;
  const mag = document.createElement('div');
  mag.className = 'mag';
  box.appendChild(mag);
  const Z = 2.6, R = 92;
  function draw(e){
    const r = box.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const nat = (img.naturalWidth || 4) / (img.naturalHeight || 3);
    const boxA = r.width / r.height;
    let bw, bh;
    if(nat > boxA){ bh = r.height * Z; bw = bh * nat; }   // wider than the frame
    else          { bw = r.width  * Z; bh = bw / nat; }
    const ox = (bw - r.width  * Z) / 2;                   // the cover crop
    const oy = (bh - r.height * Z) / 2;
    mag.style.left = (x - R) + 'px';
    mag.style.top  = (y - R) + 'px';
    mag.style.backgroundImage = 'url("' + (img.currentSrc || img.src) + '")';
    mag.style.backgroundSize = bw + 'px ' + bh + 'px';
    mag.style.backgroundPosition = (-(x * Z - R + ox)) + 'px ' + (-(y * Z - R + oy)) + 'px';
  }
  box.addEventListener('pointerenter', e=>{
    if(e.pointerType !== 'mouse') return;
    box.classList.add('lenson'); draw(e);
  });
  box.addEventListener('pointermove', e=>{ if(e.pointerType === 'mouse') draw(e); });
  box.addEventListener('pointerleave', ()=> box.classList.remove('lenson'));
});

/* ── the olive branch ─────────────────────────────────────────────────
   Zack's idea: the wreath, growing as you scroll, down the side of the page.
   A branch rather than a whole ring, in the right margin the left-anchored
   layout freed up, so the empty half of a wide screen is doing something.

   Scroll-driven, not time-driven: the stem draws itself in proportion to how
   far through the document you are, so it reads as progress rather than
   decoration. Same leaf greens and stem brown as the 3D wreath on the cover.

   It is atmosphere, so it stays out of the way: low opacity, aria-hidden,
   pointer-events none, off entirely below 1040px where there is no margin to
   put it in, and drawn complete-and-still for anyone asking for less motion. */
(function(){
  if(!document.querySelector('main')) return;
  if(!matchMedia('(min-width:1040px)').matches) return;

  const NS='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(NS,'svg');
  svg.setAttribute('id','vine');
  /* `meet`, not `slice`: slice cropped the last fifth of the branch, so it
     never finished drawing at the bottom of a page. The box is wider than the
     stem needs so the leaves have somewhere to go without being clipped. */
  svg.setAttribute('viewBox','0 0 130 1000');
  svg.setAttribute('preserveAspectRatio','xMidYMid meet');
  svg.setAttribute('aria-hidden','true');

  const stem=document.createElementNS(NS,'path');
  stem.setAttribute('d','M66 0 C 38 240, 94 470, 64 700 C 42 860, 80 940, 68 1000');
  stem.setAttribute('fill','none');
  stem.setAttribute('stroke','#5d4c30');
  stem.setAttribute('stroke-width','2.4');
  stem.setAttribute('stroke-linecap','round');
  svg.appendChild(stem);
  document.body.appendChild(svg);

  const L=stem.getTotalLength();
  stem.style.strokeDasharray=L;

  // leaves hung off the stem, alternating sides, sampled along the real curve
  const greens=['#5e7048','#6d7f52','#7c8f5e','#8a9a68','#9cab7b'];
  const leaves=[];
  const N=26;
  for(let i=1;i<=N;i++){
    const t=i/(N+1);
    const pt=stem.getPointAtLength(t*L);
    const ahead=stem.getPointAtLength(Math.min(L,t*L+1));
    const ang=Math.atan2(ahead.y-pt.y,ahead.x-pt.x)*180/Math.PI;
    const side=(i%2)?1:-1;
    const g=document.createElementNS(NS,'g');
    const leaf=document.createElementNS(NS,'path');
    // a lens: same silhouette as the 3D leaf, flattened
    leaf.setAttribute('d','M0 0 Q 9 5.5, 21 0 Q 9 -5.5, 0 0');
    leaf.setAttribute('fill',greens[i%greens.length]);
    g.appendChild(leaf);
    g.setAttribute('transform','translate('+pt.x+','+pt.y+') rotate('+(ang+side*38)+') scale(0)');
    g.dataset.at=t; g.dataset.base='translate('+pt.x+','+pt.y+') rotate('+(ang+side*38)+')';
    svg.appendChild(g);
    leaves.push(g);
  }

  const calm=matchMedia('(prefers-reduced-motion: reduce)');
  function draw(p){
    stem.style.strokeDashoffset=L*(1-p);
    for(const g of leaves){
      const k=Math.max(0,Math.min(1,(p-g.dataset.at)/0.05));
      const e=1-Math.pow(1-k,3);
      g.setAttribute('transform',g.dataset.base+' scale('+e.toFixed(3)+')');
    }
  }
  if(calm.matches){ draw(1); return; }

  let ticking=false;
  function onScroll(){
    if(ticking) return; ticking=true;
    requestAnimationFrame(()=>{
      const h=document.documentElement;
      const max=h.scrollHeight-h.clientHeight;
      draw(max>0?Math.min(1,h.scrollTop/max):0);
      ticking=false;
    });
  }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',onScroll,{passive:true});
  draw(0);
})();
