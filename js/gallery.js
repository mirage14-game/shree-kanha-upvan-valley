(function(){
  const cards=[...document.querySelectorAll('.gallery-card')];
  const filters=[...document.querySelectorAll('.gallery-filter')];
  const lightbox=document.getElementById('galleryLightbox');
  const lbVideo=document.getElementById('lightboxVideo');
  const lbTitle=document.getElementById('lightboxTitle');
  const close=document.getElementById('lightboxClose');
  const prev=document.getElementById('lightboxPrev');
  const next=document.getElementById('lightboxNext');
  let visibleCards=cards.slice(); let current=0;

  cards.forEach(card=>{
    const v=card.querySelector('video');
    if(v){
      v.muted=true; v.loop=true; v.playsInline=true;
      card.addEventListener('mouseenter',()=>v.play().catch(()=>{}));
      card.addEventListener('mouseleave',()=>{v.pause(); v.currentTime=0;});
    }
    card.addEventListener('click',()=>{
      current=visibleCards.indexOf(card);
      openCard(card);
    });
  });

  filters.forEach(btn=>btn.addEventListener('click',()=>{
    filters.forEach(b=>b.classList.remove('active')); btn.classList.add('active');
    const filter=btn.dataset.filter;
    cards.forEach(card=>card.classList.toggle('hidden',filter!=='all' && card.dataset.type!==filter));
    visibleCards=cards.filter(card=>!card.classList.contains('hidden'));
  }));

  function openCard(card){
    const source=card.dataset.video;
    lbVideo.src=source; lbVideo.poster=card.dataset.poster;
    lbTitle.textContent=card.dataset.title;
    lightbox.classList.add('open'); document.body.style.overflow='hidden';
    lbVideo.play().catch(()=>{});
  }
  function closeBox(){lbVideo.pause(); lbVideo.removeAttribute('src'); lbVideo.load(); lightbox.classList.remove('open'); document.body.style.overflow='';}
  function move(dir){if(!visibleCards.length)return; current=(current+dir+visibleCards.length)%visibleCards.length; openCard(visibleCards[current]);}
  close.addEventListener('click',closeBox); prev.addEventListener('click',()=>move(-1)); next.addEventListener('click',()=>move(1));
  lightbox.addEventListener('click',e=>{if(e.target===lightbox)closeBox()});
  document.addEventListener('keydown',e=>{if(!lightbox.classList.contains('open'))return;if(e.key==='Escape')closeBox();if(e.key==='ArrowLeft')move(-1);if(e.key==='ArrowRight')move(1)});
})();
