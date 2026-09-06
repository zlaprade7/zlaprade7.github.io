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
