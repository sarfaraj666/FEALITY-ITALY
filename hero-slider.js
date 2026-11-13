(() => {
  'use strict';
  const hero = document.querySelector('.home-hero, .collection-hero');
  if (!hero) return;
  const dragMode = document.body.classList.contains('home-page');
  // Approved hero selections. Originals and existing responsive derivatives are unchanged.
  const photo = (folder, number, width, height, alt) => ({
    src: `${folder}/web/${number}-960.webp`,
    srcset: `${folder}/web/${number}-480.webp 480w, ${folder}/web/${number}-960.webp 960w, ${folder}/web/${number}-1600.webp 1600w`,
    width, height, alt
  });
  const kitchen = [
    photo('assets/images/kitchen-photos', 1, 1916, 821, 'Kitchen island with wide landscape windows'),
    photo('assets/images/kitchen-photos', 3, 1932, 814, 'Pale kitchen island beside panoramic windows'),
    photo('assets/images/kitchen-photos', 4, 1930, 815, 'Veined island and wood kitchen cabinetry')
  ];
  const wardrobes = [
    photo('assets/wardrobes', 1, 1916, 821, 'Wardrobe with glass doors and open storage'),
    photo('assets/wardrobes', 2, 1916, 821, 'Walk-in wardrobe with drawers and hanging space'),
    photo('assets/wardrobes', 3, 1869, 842, 'Wardrobe with pale cabinetry and open compartments')
  ];
  const vanity = [
    photo('assets/vanity', 1, 1916, 821, 'Floating vanity with rectangular mirror'),
    photo('assets/vanity', 2, 1870, 841, 'Wide bathroom vanity and wall mirror'),
    photo('assets/vanity', 3, 1870, 841, 'Floating vanity beside full-height windows')
  ];
  const balcony = [
    {
      src: 'assets/balcony/web/2-960.webp',
      srcset: 'assets/balcony/web/2-480.webp 480w, assets/balcony/web/2-960.webp 960w, assets/balcony/2.png 1671w',
      width: 1671, height: 941,
      alt: 'Balcony collection with architectural outdoor storage cabinetry'
    }
  ];
  const slides = document.body.classList.contains('home-page') ? [kitchen[0], wardrobes[0], vanity[0], balcony[0]]
    : hero.classList.contains('wardrobe-hero') ? wardrobes
    : hero.classList.contains('vanity-hero') ? vanity : kitchen;
  // Home copy travels with the corresponding collection photograph.
  const homeContent = [
    { title: 'Kitchen', description: 'Considered spaces for cooking, gathering and everyday living.', label: 'Explore Kitchen', href: 'kitchen.html' },
    { title: 'Wardrobes', description: 'A considered place for clothing, accessories and the everyday.', label: 'Explore Wardrobes', href: 'wardrobes.html' },
    { title: 'Vanity', description: 'Quiet forms, thoughtful storage and space for daily rituals.', label: 'Explore Vanity', href: 'vanity.html' },
    { title: 'Balcony', description: 'Thoughtfully designed cabinetry for elevated outdoor living.', label: 'Explore Balcony', href: 'balcony.html' }
  ];
  function updateHomeContent(index) {
    if (!dragMode) return;
    const content = homeContent[index];
    hero.querySelector('#homeTitle').textContent = content.title;
    hero.querySelector('.collection-hero-description').textContent = content.description;
    hero.querySelectorAll('.hero-content a').forEach(link => {
      link.setAttribute('href', content.href);
      // Preserve the existing decorative arrow and desktop/mobile button styles.
      link.firstChild.textContent = content.label + ' ';
    });
  }
  updateHomeContent(0);
  let image = hero.querySelector('img.hero-background');
  if (!image) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, requested = 0, generation = 0, timer;
  let paused = dragMode, hovered = false, inView = true;
  hero.classList.add('has-hero-slider');
  hero.setAttribute('aria-roledescription', 'carousel');
  const controls = document.createElement('div');
  controls.className = 'collection-hero-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Hero slideshow controls');
  controls.innerHTML = `<div class="collection-hero-dots">${slides.map((slide, i) => `<button type="button" data-hero-index="${i}" aria-label="Show hero photo ${i + 1}" aria-pressed="${i === 0}"><span></span></button>`).join('')}</div><div class="collection-hero-actions"><span class="collection-hero-counter">01 / 03</span><button type="button" data-hero-action="previous" aria-label="Previous hero photo">←</button><button type="button" data-hero-action="next" aria-label="Next hero photo">→</button><button type="button" data-hero-action="pause" aria-label="Pause hero slideshow">Pause</button></div>`;
  if (dragMode) controls.querySelector('.collection-hero-actions').remove();
  hero.append(controls);
  const status = document.createElement('span');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  hero.append(status);
  const pauseButton = controls.querySelector('[data-hero-action="pause"]');
  function schedule() {
    clearTimeout(timer);
    if (!dragMode && !paused && !hovered && inView && !document.hidden && !reducedMotion.matches) {
      timer = setTimeout(() => show(current + 1, false), 6000);
    }
  }
  function updatePause() {
    if (pauseButton) {
      pauseButton.disabled = reducedMotion.matches;
      pauseButton.textContent = reducedMotion.matches ? 'Auto off' : paused ? 'Play' : 'Pause';
      pauseButton.setAttribute('aria-label', reducedMotion.matches ? 'Automatic slideshow disabled for reduced motion' : paused ? 'Play hero slideshow' : 'Pause hero slideshow');
    }
    schedule();
  }
  async function show(index, manual = true) {
    clearTimeout(timer);
    requested = (index + slides.length) % slides.length;
    const nextIndex = requested, token = ++generation, slide = slides[nextIndex];
    if (manual) { paused = true; updatePause(); }
    if (nextIndex === current) { schedule(); return; }
    const nextImage = new Image();
    nextImage.className = 'hero-background hero-slide-image';
    Object.assign(nextImage, { sizes: '(max-width: 600px) 1400px, 100vw', srcset: slide.srcset, src: slide.src,
      width: slide.width, height: slide.height, alt: slide.alt, decoding: 'async' });
    try {
      await nextImage.decode();
      if (token !== generation) return;
      const previousImage = image;
      nextImage.style.opacity = '0';
      hero.insertBefore(nextImage, previousImage.nextSibling);
      // Commit the initial opacity before starting the crossfade.
      void nextImage.offsetWidth;
      nextImage.style.opacity = '1';
      previousImage.style.opacity = '0';
      previousImage.setAttribute('aria-hidden', 'true');
      image = nextImage;
      current = nextIndex;
      updateHomeContent(current);
      const counter = controls.querySelector('.collection-hero-counter');
      if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      controls.querySelectorAll('[data-hero-index]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
      if (manual) status.textContent = `Photo ${current + 1} of ${slides.length}: ${slide.alt}`;
      setTimeout(() => previousImage.remove(), reducedMotion.matches ? 0 : 700);
    } catch {
      if (token !== generation) return;
      requested = current;
      if (manual) status.textContent = 'Photo could not load. Please try again.';
    }
    schedule();
  }
  controls.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.heroAction === 'pause') { paused = !paused; updatePause(); }
    else if (button.dataset.heroIndex !== undefined) show(Number(button.dataset.heroIndex));
    else show(requested + (button.dataset.heroAction === 'next' ? 1 : -1));
  });
  {
    hero.tabIndex = 0;
    const instruction = document.createElement('span');
    instruction.id = 'hero-swipe-instructions';
    instruction.className = 'sr-only';
    instruction.textContent = `Drag or swipe left and right to explore the ${slides.length} photos. You can also use the left and right arrow keys or photo buttons.`;
    hero.append(instruction);
    hero.setAttribute('aria-describedby', instruction.id);
    let start = null;
    hero.addEventListener('dragstart', event => { if (event.target.tagName === 'IMG') event.preventDefault(); });
    hero.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('a, button, input')) return;
      start = { id: event.pointerId, x: event.clientX, y: event.clientY };
      hero.setPointerCapture(event.pointerId);
      hero.classList.add('is-dragging');
      if (event.pointerType === 'mouse') event.preventDefault();
    });
    hero.addEventListener('pointerup', event => {
      if (!start || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y;
      start = null;
      hero.classList.remove('is-dragging');
      if (hero.hasPointerCapture(event.pointerId)) hero.releasePointerCapture(event.pointerId);
      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        show(requested + (dx < 0 ? 1 : -1));
      }
    });
    for (const type of ['pointercancel', 'lostpointercapture']) {
      hero.addEventListener(type, () => { start = null; hero.classList.remove('is-dragging'); });
    }
  }
  hero.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(requested + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  hero.addEventListener('focusin', event => {
    // Focusing Pause must not flip its state before its click is handled.
    if (event.target === pauseButton) { clearTimeout(timer); return; }
    paused = true;
    updatePause();
  });
  hero.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  hero.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', updatePause);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }, { threshold: 0.15 }).observe(hero);
  }
  updatePause();
})();
