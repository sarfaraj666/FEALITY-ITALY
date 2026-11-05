(() => {
  'use strict';
  const main = document.getElementById('mainContent');
  if (!main || !('IntersectionObserver' in window)) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const selector = '.section-header, .home-collections-grid > article, .home-pathway-grid > div, .collection-featured-grid > *, .collection-detail-grid > *, .collection-editorial-copy, #kitchen-grid > *, .intro-grid, .statement-content, .showroom-copy, .journal-grid > article';
  const seen = new WeakSet();
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.remove('is-pending');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.06, rootMargin: '0px 0px 24px 0px' });

  function register() {
    if (reducedMotion.matches) return;
    main.querySelectorAll(selector).forEach((node, index) => {
      if (seen.has(node)) return;
      seen.add(node);
      // Above-the-fold and hash-linked content is available immediately.
      if (node.getBoundingClientRect().top < window.innerHeight) return;
      node.style.setProperty('--collection-motion-delay', `${(index % 4) * 50}ms`);
      node.classList.add('collection-motion', 'is-pending');
      observer.observe(node);
    });
  }
  register();
  // Gallery filters rebuild their cards; observe only this existing dynamic grid.
  const grid = document.getElementById('kitchen-grid');
  if (grid) new MutationObserver(register).observe(grid, { childList: true });
  function revealAll() {
    observer.disconnect();
    main.querySelectorAll('.is-pending').forEach(node => node.classList.remove('is-pending'));
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) revealAll();
    else register();
  });
  // Never leave restored browser-history content hidden.
  window.addEventListener('pageshow', event => { if (event.persisted) revealAll(); });

  // Gentle image depth on desktop. A shared hero variable also applies to new slider images.
  const hero = main.querySelector('.home-hero, .collection-hero');
  const desktop = window.matchMedia('(min-width: 901px)');
  if (!hero) return;
  let frame = 0;
  function paintHero() {
    frame = 0;
    if (reducedMotion.matches || !desktop.matches) {
      hero.style.removeProperty('--hero-scroll-offset');
      return;
    }
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / rect.height));
    // Stay inside the image overscan so no empty edges appear while scrolling.
    const distance = Math.min(24, rect.height * .025) * progress;
    hero.style.setProperty('--hero-scroll-offset', `${distance.toFixed(2)}px`);
  }
  function queueHero() {
    if (!frame) frame = requestAnimationFrame(paintHero);
  }
  window.addEventListener('scroll', queueHero, { passive: true });
  window.addEventListener('resize', queueHero, { passive: true });
  window.addEventListener('pageshow', queueHero);
  reducedMotion.addEventListener('change', queueHero);
  desktop.addEventListener('change', queueHero);
  queueHero();
})();
