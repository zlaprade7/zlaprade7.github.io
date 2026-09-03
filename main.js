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
