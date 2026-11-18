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
      src: 'assets/Balcony/web/2-960.webp',
      srcset: 'assets/Balcony/web/2-480.webp 480w, assets/Balcony/web/2-960.webp 960w, assets/Balcony/2.png 1671w',
      width: 1671, height: 941,
      alt: 'Balcony collection with architectural outdoor storage cabinetry'
    }
  ];
  const slides = document.body.classList.contains('home-page') ? [kitchen[0], wardrobes[0], vanity[0], balcony[0]]
    : hero.classList.contains('wardrobe-hero') ? wardrobes
    : hero.classList.contains('vanity-hero') ? vanity : kitchen;

  // Preload all slides so transitions are instantaneous on swipe/click
  slides.forEach(slide => {
    const pre = new Image();
    pre.sizes = '(max-width: 600px) 1400px, 100vw';
    pre.srcset = slide.srcset;
    pre.src = slide.src;
  });
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
    const contentEl = hero.querySelector('.hero-content');
    if (contentEl) {
      contentEl.classList.add('is-fading');
      setTimeout(() => {
        hero.querySelector('#homeTitle').textContent = content.title;
        hero.querySelector('.collection-hero-description').textContent = content.description;
        hero.querySelectorAll('.hero-content a').forEach(link => {
          link.setAttribute('href', content.href);
          // Preserve the existing decorative arrow and desktop/mobile button styles.
          link.firstChild.textContent = content.label + ' ';
        });
        contentEl.classList.remove('is-fading');
      }, 200);
    }
  }
  updateHomeContent(0);
  let image = hero.querySelector('img.hero-background');
  if (!image) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, requested = 0, generation = 0, timer;
  let paused = false, hovered = false, inView = true;
  const slideInterval = dragMode ? 4000 : 6000;
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
    if (!paused && !hovered && inView && !document.hidden && !reducedMotion.matches) {
      timer = setTimeout(() => show(current + 1, false), slideInterval);
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
    if (manual) {
      if (!dragMode && pauseButton) {
        paused = true;
        updatePause();
      }
    }
    if (nextIndex === current) { schedule(); return; }
    const nextImage = new Image();
    nextImage.className = 'hero-background hero-slide-image';
    Object.assign(nextImage, { sizes: '(max-width: 600px) 1400px, 100vw', srcset: slide.srcset, src: slide.src,
      width: slide.width, height: slide.height, alt: slide.alt, decoding: 'async' });
    try {
      if ('decode' in nextImage) {
        await nextImage.decode().catch(() => {});
      }
      if (token !== generation) return;
      const previousImage = image;
      nextImage.style.opacity = '0';
      nextImage.style.transform = 'scale(1.04)';
      hero.insertBefore(nextImage, previousImage.nextSibling);
      // Commit the initial opacity and scale before starting the crossfade.
      void nextImage.offsetWidth;
      nextImage.style.opacity = '1';
      nextImage.style.transform = 'scale(1)';
      previousImage.style.opacity = '0';
      previousImage.setAttribute('aria-hidden', 'true');
      image = nextImage;
      current = nextIndex;
      updateHomeContent(current);
      const counter = controls.querySelector('.collection-hero-counter');
      if (counter) counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      controls.querySelectorAll('[data-hero-index]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === current)));
      if (manual) status.textContent = `Photo ${current + 1} of ${slides.length}: ${slide.alt}`;
      setTimeout(() => previousImage.remove(), reducedMotion.matches ? 0 : 850);
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

    hero.addEventListener('dragstart', event => { if (event.target.tagName === 'IMG') event.preventDefault(); });

    // Touch event handling for mobile devices
    let touchStartX = null, touchStartY = null, touchStartTime = 0, isHorizontalSwipe = null;

    hero.addEventListener('touchstart', event => {
      if (event.touches.length !== 1 || event.target.closest('a, button, input')) {
        touchStartX = null;
        return;
      }
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
      touchStartTime = Date.now();
      isHorizontalSwipe = null;
    }, { passive: true });

    hero.addEventListener('touchmove', event => {
      if (touchStartX === null || event.touches.length !== 1) return;
      const currentX = event.touches[0].clientX;
      const currentY = event.touches[0].clientY;
      const dx = currentX - touchStartX;
      const dy = currentY - touchStartY;

      if (isHorizontalSwipe === null) {
        if (Math.abs(dx) > 7 || Math.abs(dy) > 7) {
          isHorizontalSwipe = Math.abs(dx) >= Math.abs(dy);
        }
      }

      // If user is swiping horizontally, lock vertical scroll so gesture is never interrupted
      if (isHorizontalSwipe === true) {
        if (event.cancelable) event.preventDefault();
      }
    }, { passive: false });

    hero.addEventListener('touchend', event => {
      if (touchStartX === null) return;
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const dx = endX - touchStartX;
      const dy = endY - touchStartY;
      const elapsed = Date.now() - touchStartTime;
      const wasHorizontal = isHorizontalSwipe === true || Math.abs(dx) > Math.abs(dy);

      touchStartX = null;
      touchStartY = null;
      isHorizontalSwipe = null;

      // Sensitive & responsive threshold: 35px or quick flick (20px in < 350ms)
      if (wasHorizontal && (Math.abs(dx) >= 35 || (Math.abs(dx) >= 20 && elapsed < 350))) {
        show(requested + (dx < 0 ? 1 : -1));
      }
    }, { passive: true });

    hero.addEventListener('touchcancel', () => {
      touchStartX = null;
      touchStartY = null;
      isHorizontalSwipe = null;
    }, { passive: true });

    // Mouse drag support for desktop
    let mouseStartX = null, mouseStartY = null, mouseStartTime = 0;

    hero.addEventListener('mousedown', event => {
      if (event.button !== 0 || event.target.closest('a, button, input')) return;
      mouseStartX = event.clientX;
      mouseStartY = event.clientY;
      mouseStartTime = Date.now();
      hero.classList.add('is-dragging');
    });

    window.addEventListener('mouseup', event => {
      if (mouseStartX === null) return;
      const dx = event.clientX - mouseStartX;
      const dy = event.clientY - mouseStartY;
      const elapsed = Date.now() - mouseStartTime;

      mouseStartX = null;
      mouseStartY = null;
      hero.classList.remove('is-dragging');

      if (Math.abs(dx) >= 40 || (Math.abs(dx) >= 25 && elapsed < 350)) {
        if (Math.abs(dx) > Math.abs(dy)) {
          show(requested + (dx < 0 ? 1 : -1));
        }
      }
    });
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
    if (!dragMode) {
      paused = true;
      updatePause();
    }
  });
  if (window.matchMedia('(hover: hover)').matches) {
    hero.addEventListener('mouseenter', () => { hovered = true; schedule(); });
    hero.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  }
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', updatePause);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; schedule(); }, { threshold: 0.15 }).observe(hero);
  }
  updatePause();
})();
