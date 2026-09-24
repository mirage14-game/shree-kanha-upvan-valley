(function(){
  const targetSelector = [
    '.why-card-image img',
    '.project-card-image',
    '.connectivity-map img',
    '.map-frame img',
    '.gallery-poster',
    '.gallery-card video'
  ].join(',');

  const body = document.body;
  body.classList.add('media-polish-ready');

  const reveal = (el) => {
    requestAnimationFrame(() => el.classList.add('media-polish-visible'));
  };

  document.querySelectorAll(targetSelector).forEach((el) => {
    if (el.tagName === 'IMG') {
      if (el.complete) reveal(el);
      else {
        el.addEventListener('load', () => reveal(el), { once:true });
        el.addEventListener('error', () => reveal(el), { once:true });
      }
    } else {
      if (el.readyState >= 2) reveal(el);
      else {
        el.addEventListener('loadeddata', () => reveal(el), { once:true });
        el.addEventListener('error', () => reveal(el), { once:true });
        /* Avoid keeping a video hidden when only its poster is available. */
        setTimeout(() => reveal(el), 900);
      }
    }
  });

  const markLoaded = () => body.classList.add('media-polish-loaded');
  if (document.readyState === 'complete') markLoaded();
  else window.addEventListener('load', markLoaded, { once:true });
})();
