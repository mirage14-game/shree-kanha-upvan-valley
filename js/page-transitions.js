/* =========================================
   SOFT PREMIUM PAGE TRANSITIONS
   ========================================= */
(function () {
  'use strict';

  const MEDIA = window.matchMedia('(prefers-reduced-motion: reduce)');
  const REDUCED_MOTION = MEDIA.matches;
  const LEAVE_MS = 610;
  const ENTRY_MS = 820;

  document.body.classList.add('page-transition-enabled');

  // Give the new page a quiet, polished arrival.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add('page-entering');
      window.setTimeout(function () {
        document.body.classList.remove('page-entering');
      }, ENTRY_MS);
    });
  });

  if (REDUCED_MOTION) return;

  function isInternalDocumentLink(anchor) {
    if (!anchor || !anchor.href) return false;

    const href = anchor.getAttribute('href');
    if (!href || href === '#' || href.startsWith('#')) return false;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return false;
    if (anchor.target && anchor.target !== '_self') return false;
    if (anchor.hasAttribute('download')) return false;

    let url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (error) {
      return false;
    }

    if (url.origin !== window.location.origin) return false;

    const current = new URL(window.location.href);
    const sameDocument = url.pathname === current.pathname && url.search === current.search;
    if (sameDocument) return false;

    return true;
  }

  document.addEventListener('click', function (event) {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.target.closest('a');
    if (!isInternalDocumentLink(anchor)) return;

    event.preventDefault();

    const destination = anchor.href;
    document.body.classList.add('is-leaving');

    window.setTimeout(function () {
      window.location.assign(destination);
    }, LEAVE_MS);
  });

  // Avoid keeping the leaving veil during cache-based back/forward navigation.
  window.addEventListener('pageshow', function () {
    document.body.classList.remove('is-leaving');
  });
}());
