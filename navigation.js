(() => {
  'use strict';

  // 1. Mobile Menu Panel
  const menuPanel = document.getElementById('menuPanel');
  const menuToggle = document.getElementById('menuToggle');
  const menuClose = document.getElementById('menuClose');

  // 2. Search Panel
  const searchPanel = document.getElementById('searchPanel');
  const searchToggle = document.getElementById('searchToggle');
  const searchClose = document.getElementById('searchClose');
  const siteSearch = document.getElementById('siteSearch');
  const searchResults = document.getElementById('searchResults');

  if (searchPanel) searchPanel.inert = true;
  let lastFocusedElement = null;

  function setPanelState(panel, isOpen) {
    if (!panel) return;
    panel.classList.toggle('open', isOpen);
    panel.inert = !isOpen;
    panel.setAttribute('aria-hidden', String(!isOpen));
    const anyOpen = (menuPanel && menuPanel.classList.contains('open')) || (searchPanel && searchPanel.classList.contains('open'));
    document.body.style.overflow = anyOpen ? 'hidden' : '';

    if (panel === menuPanel && menuToggle) {
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    }

    if (!isOpen && !anyOpen && lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  if (menuToggle && menuPanel) {
    menuToggle.addEventListener('click', () => {
      lastFocusedElement = menuToggle;
      setPanelState(searchPanel, false);
      setPanelState(menuPanel, true);
      menuPanel.scrollTop = 0;
      if (menuClose) menuClose.focus({ preventScroll: true });
    });
  }

  if (menuClose && menuPanel) {
    menuClose.addEventListener('click', () => setPanelState(menuPanel, false));
  }

  if (menuPanel) {
    menuPanel.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setPanelState(menuPanel, false));
    });
  }

  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      lastFocusedElement = searchToggle;
      setPanelState(menuPanel, false);
      setPanelState(searchPanel, true);
      if (siteSearch) siteSearch.focus();
    });
  }

  if (searchClose && searchPanel) {
    searchClose.addEventListener('click', () => setPanelState(searchPanel, false));
  }

  // Keyboard trap and Escape handler for dialog overlays
  document.addEventListener('keydown', event => {
    const activePanel = (menuPanel && menuPanel.classList.contains('open')) ? menuPanel
      : (searchPanel && searchPanel.classList.contains('open')) ? searchPanel
      : null;

    if (!activePanel) return;

    if (event.key === 'Escape') {
      setPanelState(activePanel, false);
      return;
    }

    if (event.key === 'Tab') {
      const focusable = [...activePanel.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled)')];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // 3. Search indexing across collections and editorial pages
  if (siteSearch && searchResults) {
    const searchableItems = [
      { name: 'Kitchen', category: 'COLLECTION', url: 'kitchen.html' },
      { name: 'Wardrobes', category: 'COLLECTION', url: 'wardrobes.html' },
      { name: 'Bathroom Vanity', category: 'COLLECTION', url: 'vanity.html' },
      { name: 'Balcony', category: 'COLLECTION', url: 'balcony.html' },
      { name: 'Kitchen Island & Stone Worktops', category: 'KITCHEN ELEMENT', url: 'kitchen.html#kitchen-gallery' },
      { name: 'Cabinet Fronts & Illuminated Shelving', category: 'KITCHEN ELEMENT', url: 'kitchen.html#kitchen-gallery' },
      { name: 'Full Kitchen Gallery (16 Designs)', category: 'GALLERY', url: 'kitchen.html#kitchen-gallery' },
      { name: 'Wardrobe Glass Doors & Divided Drawers', category: 'WARDROBE ELEMENT', url: 'wardrobes.html#kitchen-gallery' },
      { name: 'Pull-Out Storage & Accessory Trays', category: 'WARDROBE ELEMENT', url: 'wardrobes.html#kitchen-gallery' },
      { name: 'Full Wardrobes Gallery (14 Designs)', category: 'GALLERY', url: 'wardrobes.html#kitchen-gallery' },
      { name: 'Floating Vanity & Backlit Mirrors', category: 'VANITY ELEMENT', url: 'vanity.html#kitchen-gallery' },
      { name: 'Wall Cabinets & Stainless Steel Basins', category: 'VANITY ELEMENT', url: 'vanity.html#kitchen-gallery' },
      { name: 'Full Vanity Gallery (14 Designs)', category: 'GALLERY', url: 'vanity.html#kitchen-gallery' },
      { name: 'About FEALITY ITALY', category: 'INFORMATION', url: 'about.html' },
      { name: 'How It Works & Process', category: 'INFORMATION', url: 'how-it-works.html' },
      { name: 'FAQs - Frequently Asked Questions', category: 'INFORMATION', url: 'faqs.html' },
      { name: 'Terms & Policies', category: 'INFORMATION', url: 'terms-policies.html' }
    ];

    siteSearch.addEventListener('input', event => {
      const query = event.target.value.toLowerCase().trim();
      if (!query) {
        searchResults.innerHTML = '';
        return;
      }

      const matches = searchableItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        searchResults.innerHTML = matches.map(item =>
          `<a href="${item.url}">${item.name} <span>${item.category} ↗</span></a>`
        ).join('');
        searchResults.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => setPanelState(searchPanel, false));
        });
      } else {
        searchResults.innerHTML = '<p class="search-empty">No matching collections or elements found.</p>';
      }
    });
  }

  // 4. Pixel-consistent Transparent Navbar with scroll behaviour
  const siteHeader = document.getElementById('siteHeader');
  function handleHeaderScroll() {
    if (siteHeader) {
      siteHeader.classList.toggle('scrolled', window.scrollY > 70);
    }
  }
  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // 5. Language button feedback
  const langButton = document.getElementById('languageButton');
  if (langButton) {
    langButton.addEventListener('click', () => {
      alert('This demo currently supports English only.');
    });
  }

  // 6. Scroll Progress Bar
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    function updateProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }

  // 8. GOAL A: Smooth, Restrained Navigation Transitions
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    if (link.target && link.target !== '_self') return;

    try {
      const targetUrl = new URL(link.href, window.location.href);
      if (targetUrl.origin !== window.location.origin) return;
      if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) return;

      if (reducedMotionQuery.matches) return;

      // When browser supports cross-document View Transitions natively, let browser animate natively
      if (document.startViewTransition && window.navigation) return;

      event.preventDefault();
      document.body.classList.add('is-page-transitioning');
      setTimeout(() => {
        window.location.href = targetUrl.href;
      }, 140);
    } catch (_) {
      // Allow default navigation if parsing fails
    }
  });

  // bfcache back/forward instant recovery
  window.addEventListener('pageshow', () => {
    if (menuPanel && menuPanel.classList.contains('open')) setPanelState(menuPanel, false);
    document.body.classList.remove('is-page-transitioning');
  });

  // 9. Backwards compatibility for bookmarked hashes on index.html
  if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
    const hash = window.location.hash;
    if (hash === '#collection' || hash === '#kitchen-gallery' || hash === '#elements' || hash === '#philosophy' || hash === '#showroom' || hash === '#journal') {
      window.location.replace(`kitchen.html${hash}`);
    }
  }

  // 10. Kitchen Cinematic Hero Slider
  function initKitchenHeroSlider() {
    const hero = document.querySelector('.kitchen-cinematic-hero');
    if (!hero) return;

    const slides      = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots        = Array.from(hero.querySelectorAll('.hero-dot'));
    const prevBtn     = hero.querySelector('#heroPrevBtn');
    const nextBtn     = hero.querySelector('#heroNextBtn');
    const countEl     = hero.querySelector('#heroSlideCount');
    const total       = slides.length;
    if (!total) return;

    let current  = 0;
    let timer    = null;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function pad(n) {
      return String(n + 1).padStart(2, '0');
    }

    function showSlide(index) {
      const next = ((index % total) + total) % total;

      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === next);
        slide.setAttribute('aria-hidden', i === next ? 'false' : 'true');
      });

      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === next);
        dot.setAttribute('aria-selected', i === next ? 'true' : 'false');
      });

      if (countEl) {
        countEl.textContent = pad(next) + ' / ' + pad(total - 1);
      }

      current = next;
    }

    function startAuto() {
      stopAuto();
      if (prefersReducedMotion) return;
      timer = setInterval(function() {
        showSlide(current + 1);
      }, 5000);
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Arrow buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        stopAuto();
        showSlide(current - 1);
        startAuto();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        stopAuto();
        showSlide(current + 1);
        startAuto();
      });
    }

    // Dot indicators
    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        const target = Number(dot.dataset.slide);
        if (!isNaN(target)) {
          stopAuto();
          showSlide(target);
          startAuto();
        }
      });
    });

    // Horizontal gestures leave vertical page scrolling and links available.
    let swipe = null;
    hero.style.touchAction = 'pan-y pinch-zoom';
    hero.addEventListener('dragstart', event => { if (event.target.tagName === 'IMG') event.preventDefault(); });
    hero.addEventListener('pointerdown', event => {
      if (!event.isPrimary) { swipe = null; return; }
      if (event.button !== 0 || event.target.closest('a, button, input')) return;
      stopAuto();
      swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
      hero.setPointerCapture(event.pointerId);
    });
    hero.addEventListener('pointerup', event => {
      if (!swipe || swipe.id !== event.pointerId) return;
      const dx = event.clientX - swipe.x, dy = event.clientY - swipe.y;
      swipe = null;
      if (hero.hasPointerCapture(event.pointerId)) hero.releasePointerCapture(event.pointerId);
      if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showSlide(current + (dx < 0 ? 1 : -1));
    });
    for (const type of ['pointercancel', 'lostpointercapture']) hero.addEventListener(type, () => { swipe = null; });

    // Keyboard navigation on the hero section
    hero.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        stopAuto();
        showSlide(current - 1);
        startAuto();
      } else if (e.key === 'ArrowRight') {
        stopAuto();
        showSlide(current + 1);
        startAuto();
      }
    });

    // Pause on hover / focus
    hero.addEventListener('mouseenter', stopAuto);
    hero.addEventListener('mouseleave', startAuto);
    hero.addEventListener('focusin',    stopAuto);
    hero.addEventListener('focusout',   startAuto);

    // Initialise first slide state and start
    showSlide(0);
    startAuto();
  }

  initKitchenHeroSlider();
})();
