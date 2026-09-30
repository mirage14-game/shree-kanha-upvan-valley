/* =========================================================
   PHASE 3 — SCROLL & SECTION REVEALS
   Adds motion only; existing content and structure stay intact.
   ========================================================= */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;
  body.classList.add('scroll-reveal-ready');

  const page = document.querySelector('main');
  if (!page) return;

  /* Target existing elements by their current semantic classes.
     No HTML content is modified. */
  const selectors = [
    // Shared section-level content
    '.about-grid',
    '.why-topline',
    '.why-heading-row',
    '.amenities-heading',
    '.reviews-heading',
    '.final-cta-copy',
    '.final-cta-visual',
    '.section-heading',
    '.connectivity-map',
    '.connectivity-copy',
    '.project-note > div',
    '.project-note > a',
    '.location-heading',
    '.location-map-wrap',
    '.location-actions',
    '.gallery-filters',
    '.gallery-note',
    '.service-highlights',

    // About page — keep the same viewport reveal motion as the other pages
    '.about-hero-grid',
    '.about-section-head',
    '.founders-intro',
    '.founders-quote',
    '.about-features-head',
    '.about-location-copy',
    '.about-location-image',
    '.about-gallery',
    '.about-plots'
  ];

  const targets = new Set();
  selectors.forEach(function (selector) {
    page.querySelectorAll(selector).forEach(function (element) {
      if (element.closest('.hero') || element.closest('.project-hero') || element.closest('.gallery-hero')) return;
      targets.add(element);
    });
  });

  // Section feature/card groups get a gentle stagger.
  [
    '.why-card',
    '.project-feature',
    '.project-card',
    '.review-card',
    '.location-info-card',
    '.gallery-card',
    '.distance-list > div',
    '.amenity-row',
    '.founder-card',
    '.about-feature',
    '.about-distance',
    '.about-plot',
    '.about-img'
  ].forEach(function (selector) {
    page.querySelectorAll(selector).forEach(function (element) {
      if (element.closest('.hero') || element.closest('.project-hero') || element.closest('.gallery-hero')) return;
      targets.add(element);
    });
  });

  // Leave anything already intentionally animated by its own system alone.
  targets.forEach(function (element) {
    element.classList.add('reveal-item');
    if (element.matches('.connectivity-map, .location-map-wrap, .final-cta-copy, .final-cta-visual')) {
      element.classList.add('reveal-visual');
    }
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach(function (element) {
      element.classList.add('reveal-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(function (entries, io) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      element.classList.add('reveal-visible');
      io.unobserve(element);
    });
  }, {
    root:null,
    rootMargin:'0px 0px -8% 0px',
    threshold:.12
  });

  targets.forEach(function (element, index) {
    const delay = Math.min((index % 5) * 60, 240);
    element.style.setProperty('--reveal-delay', delay + 'ms');
    observer.observe(element);
  });
}());
