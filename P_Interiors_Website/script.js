(() => {
  'use strict';

  // Add the studio's confirmed email here to enable an email draft.
  const CONTACT_EMAIL = '';

  const designs = [
    { id: 1, name: 'The White Haven', style: 'Contemporary', category: 'light', palette: 'Soft white · pale stone · daylight', description: 'An open, light-filled composition with a generous island and a soft, tonal palette. A gentle setting for the rituals of everyday life.', alt: 'Bright white kitchen with a pale island and large garden-facing windows' },
    { id: 2, name: 'The Slate Studio', style: 'Modern', category: 'light', palette: 'Slate blue · cool grey · white', description: 'Cool tones and clear lines give this kitchen its quiet structure. A slate-blue island anchors a bright, contemporary setting.', alt: 'Light grey kitchen with a slate-blue island and white pendant lights' },
    { id: 3, name: 'The Urban Form', style: 'Minimal', category: 'light', palette: 'Cool grey · blue · brushed silver', description: 'A composed study in clean lines and cool colour. The central island brings focus to an uncluttered, modern kitchen.', alt: 'Modern grey and white kitchen arranged around a blue island' },
    { id: 4, name: 'The Marble Edit', style: 'Luxury', category: 'light', palette: 'Veined white · warm taupe · deep charcoal', description: 'Expressive veining meets a warm, architectural palette. Sculptural lighting and a striking island create a kitchen with presence and poise.', alt: 'Sculptural pendant over a marble-patterned kitchen island with taupe cabinetry' },
    { id: 5, name: 'The Midnight Kitchen', style: 'Contemporary', category: 'dark', palette: 'Charcoal · dark brown · warm light', description: 'A dark, enveloping palette illuminated by a single warm line of light. Understated cabinetry lets the atmosphere lead.', alt: 'Dark kitchen with charcoal cabinetry and warm under-cabinet lighting' },
    { id: 6, name: "The Chef's Table", style: 'Statement', category: 'dark', palette: 'Deep brown · black · golden light', description: 'An intimate, restaurant-inspired setting with a long counter and rich, dark tones. Designed around the pleasure of gathering.', alt: 'Moody kitchen and long dining counter with warm lighting and dark surfaces' },
    { id: 7, name: 'The Walnut House', style: 'Warm modern', category: 'warm', palette: 'Walnut brown · charcoal · soft cream', description: 'Warm brown tones soften a deep, charcoal backdrop. An inviting island and open shelving bring texture to a considered modern composition.', alt: 'Dark kitchen with warm wood-toned island and two cream bar stools' },
    { id: 8, name: 'The Dark Atelier', style: 'Minimal', category: 'dark', palette: 'Deep charcoal · warm brown · amber light', description: 'A minimal arrangement of dark surfaces and warm illumination. Quiet detailing gives this kitchen its distinctive, intimate mood.', alt: 'Minimal dark kitchen with a warm illuminated backsplash' },
    { id: 9, name: 'The Linear Loft', style: 'Contemporary', category: 'warm', palette: 'Warm wood · charcoal · soft green', description: 'Rhythmic vertical lines and a warm worktop create a calm, tactile setting. A flowing pendant adds a single expressive gesture.', alt: 'Linear dark kitchen with wood-toned worktop and sculptural curved pendant' }
  ].map(design => {
    const dimensions = [[1703, 924], [1704, 923], [1704, 923], [2019, 779], [2018, 779], [2020, 779], [2019, 779], [2018, 779], [1473, 1068]][design.id - 1];
    const base = `assets/quality/kitchen-${String(design.id).padStart(2, '0')}`;
    return { ...design, image: `${base}.webp`, cardImage: `${base}-960.webp`, smallImage: `${base}-480.webp`, srcset: `${base}-480.webp 480w, ${base}-960.webp 960w, ${base}.webp ${dimensions[0]}w`, width: dimensions[0], height: dimensions[1] };
  });

  const $ = id => document.getElementById(id);
  const collectionGrid = $('collection-grid');
  const collectionSearch = $('collection-search');
  const searchDialog = $('search-dialog');
  const detailDialog = $('detail-dialog');
  const enquiryDialog = $('enquiry-dialog');
  const menuDialog = $('mobile-menu');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = $('home');
  const heroSlides = [...document.querySelectorAll('.hero-slide[data-slide]')];
  const heroStories = [
    { kicker: 'THE MARBLE EDIT', first: 'AN EXPRESSION', second: 'OF LIVING.', design: 4 },
    { kicker: 'THE WALNUT HOUSE', first: 'THE WARMTH', second: 'OF HOME.', design: 7 },
    { kicker: 'THE WHITE HAVEN', first: 'SPACE TO', second: 'FEEL AT HOME.', design: 1 }
  ];
  let activeHeroSlide = 0;
  let heroUserPaused = motionPreference.matches;
  let heroTimer = null;
  let activeFilter = 'all';
  let currentDesign = 4;
  let briefContent = '';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function imageFor(design, large = false) {
    return large && design.id === 4 ? 'assets/quality/hero-marble.webp' : design.image;
  }

  function matches(design, query) {
    const text = `${design.name} ${design.style} ${design.category} ${design.palette} ${design.description}`.toLowerCase();
    return query.toLowerCase().trim().split(/\s+/).every(word => text.includes(word));
  }

  function renderCollection() {
    if (!collectionGrid) return;
    const query = collectionSearch?.value || '';
    const visible = designs.filter(design => (activeFilter === 'all' || design.category === activeFilter) && matches(design, query));
    const fragment = document.createDocumentFragment();
    visible.forEach(design => {
      const card = element('button', 'collection-card');
      card.type = 'button';
      card.dataset.design = String(design.id);
      card.setAttribute('aria-label', `Explore ${design.name}`);
      const media = element('span', 'card-image-wrap');
      const img = element('img');
      img.src = design.cardImage;
      img.srcset = design.srcset;
      img.sizes = '(max-width: 760px) 90vw, 43vw';
      img.alt = design.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.width = design.width;
      img.height = design.height;
      media.append(img, element('span', 'card-number', String(design.id).padStart(2, '0')));
      const info = element('span', 'card-info');
      info.append(element('span', 'card-meta', design.style), element('h3', '', design.name), element('span', 'card-description', design.palette));
      const arrow = element('span', 'card-arrow', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      card.append(media, info, arrow);
      fragment.append(card);
    });
    collectionGrid.replaceChildren(fragment);
    if ($('collection-count')) $('collection-count').textContent = `${String(visible.length).padStart(2, '0')} ${visible.length === 1 ? 'design' : 'designs'}`;
    if ($('collection-empty')) $('collection-empty').hidden = visible.length > 0;
    document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  }

  function syncScrollLock() {
    const open = [...document.querySelectorAll('dialog')].some(dialog => dialog.open);
    document.body.classList.toggle('dialog-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    $('menu-toggle')?.setAttribute('aria-expanded', String(Boolean(menuDialog?.open)));
    syncHeroTimer();
  }

  function closeDialog(dialog) {
    if (dialog?.open) dialog.close();
    syncScrollLock();
  }

  function openDialog(dialog) {
    if (!dialog) return;
    document.querySelectorAll('dialog[open]').forEach(other => {
      if (other !== dialog) other.close();
    });
    if (!dialog.open) dialog.showModal();
    syncScrollLock();
  }

  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', syncScrollLock);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
    });
  });

  function updateDetail(id) {
    const design = designs.find(item => item.id === Number(id));
    if (!design) return;
    currentDesign = design.id;
    if ($('detail-image')) {
      $('detail-image').src = imageFor(design, true);
      $('detail-image').srcset = design.id === 4
        ? 'assets/quality/hero-marble-480.webp 480w, assets/quality/hero-marble-960.webp 960w, assets/quality/hero-marble.webp 1117w'
        : design.srcset;
      $('detail-image').sizes = '(max-width: 760px) 94vw, 580px';
      $('detail-image').width = design.id === 4 ? 1117 : design.width;
      $('detail-image').height = design.id === 4 ? 1408 : design.height;
      $('detail-image').alt = design.alt;
      $('detail-image').classList.toggle('is-portrait', design.id === 4);
    }
    if ($('detail-number')) $('detail-number').textContent = `${String(design.id).padStart(2, '0')} / 09`;
    if ($('detail-style')) $('detail-style').textContent = design.style;
    if ($('detail-name')) $('detail-name').textContent = design.name;
    if ($('detail-description')) $('detail-description').textContent = design.description;
    if ($('detail-palette')) $('detail-palette').textContent = design.palette;
  }

  function showDetail(id) {
    updateDetail(id);
    closeMenu();
    openDialog(detailDialog);
  }

  function moveDetail(direction) {
    updateDetail(((currentDesign - 1 + direction + designs.length) % designs.length) + 1);
  }

  document.addEventListener('click', event => {
    const designButton = event.target.closest('[data-design]');
    if (designButton) showDetail(designButton.dataset.design);
    const enquiryButton = event.target.closest('[data-enquire]');
    if (enquiryButton) openEnquiry(enquiryButton.dataset.enquire || '');
    const filterButton = event.target.closest('[data-filter]');
    if (filterButton) {
      activeFilter = filterButton.dataset.filter;
      renderCollection();
    }
    const moodButton = event.target.closest('[data-mood]');
    if (moodButton && ['light', 'dark', 'warm', 'all'].includes(moodButton.dataset.mood)) {
      event.preventDefault();
      activeFilter = moodButton.dataset.mood;
      if (collectionSearch) collectionSearch.value = '';
      renderCollection();
      closeMenu();
      $('collection')?.scrollIntoView({ behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'start' });
    }
  });
  collectionSearch?.addEventListener('input', renderCollection);
  $('clear-filters')?.addEventListener('click', () => {
    activeFilter = 'all';
    if (collectionSearch) collectionSearch.value = '';
    renderCollection();
    collectionSearch?.focus();
  });

  function renderSearch() {
    const container = $('search-results');
    if (!container) return;
    const query = $('search-input')?.value || '';
    const visible = designs.filter(design => matches(design, query));
    const fragment = document.createDocumentFragment();
    if (!visible.length) {
      fragment.append(element('p', 'search-empty', 'No designs found. Try marble, walnut, light or dark.'));
    } else {
      visible.forEach(design => {
        const button = element('button', 'search-result');
        button.type = 'button';
        button.dataset.design = String(design.id);
        const image = element('img');
        image.src = design.smallImage;
        image.srcset = `${design.smallImage} 480w, ${design.cardImage} 960w`;
        image.sizes = '88px';
        image.alt = '';
        image.width = 88;
        image.height = 56;
        const text = element('span', 'search-result-copy');
        text.append(element('strong', '', design.name), element('small', '', design.style));
        const arrow = element('span', '', '↗');
        arrow.setAttribute('aria-hidden', 'true');
        button.append(image, text, arrow);
        fragment.append(button);
      });
    }
    container.replaceChildren(fragment);
    if ($('search-count')) $('search-count').textContent = `${visible.length} ${visible.length === 1 ? 'design' : 'designs'} found`;
  }
  $('search-open')?.addEventListener('click', () => {
    closeMenu();
    if ($('search-input')) $('search-input').value = '';
    renderSearch();
    openDialog(searchDialog);
    $('search-input')?.focus();
  });
  $('search-close')?.addEventListener('click', () => closeDialog(searchDialog));
  $('search-input')?.addEventListener('input', renderSearch);
  $('detail-close')?.addEventListener('click', () => closeDialog(detailDialog));
  $('detail-prev')?.addEventListener('click', () => moveDetail(-1));
  $('detail-next')?.addEventListener('click', () => moveDetail(1));
  detailDialog?.addEventListener('keydown', event => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      moveDetail(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  let touchStart = null;
  $('detail-image')?.addEventListener('touchstart', event => {
    if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  $('detail-image')?.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) moveDetail(dx > 0 ? -1 : 1);
    touchStart = null;
  }, { passive: true });

  function closeMenu() {
    closeDialog(menuDialog);
  }
  $('menu-toggle')?.addEventListener('click', () => {
    if (!menuDialog) return;
    if (menuDialog.open) closeMenu();
    else openDialog(menuDialog);
  });
  $('menu-close')?.addEventListener('click', closeMenu);
  menuDialog?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  function updateHeroControls() {
    const story = heroStories[activeHeroSlide];
    if (!story) return;
    if ($('hero-kicker')) $('hero-kicker').textContent = story.kicker;
    if ($('hero-line-one')) $('hero-line-one').textContent = story.first;
    if ($('hero-line-two')) $('hero-line-two').textContent = story.second;
    if ($('hero-design-name')) $('hero-design-name').textContent = designs.find(design => design.id === story.design)?.name || '';
    if ($('hero-current')) $('hero-current').textContent = `${String(activeHeroSlide + 1).padStart(2, '0')} / 03`;
    if ($('hero-discover')) {
      $('hero-discover').dataset.design = String(story.design);
      $('hero-discover').setAttribute('aria-label', `Discover ${story.kicker.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())}`);
    }
    document.querySelectorAll('[data-hero-slide]').forEach(button => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.heroSlide) === activeHeroSlide));
    });
    if ($('hero-toggle')) {
      $('hero-toggle').textContent = heroUserPaused ? '▷' : 'Ⅱ';
      $('hero-toggle').setAttribute('aria-label', heroUserPaused ? 'Resume slideshow' : 'Pause slideshow');
      $('hero-toggle').setAttribute('aria-pressed', String(heroUserPaused));
    }
  }

  function syncHeroTimer() {
    window.clearTimeout(heroTimer);
    heroTimer = null;
    if (!hero || heroSlides.length < 2 || heroUserPaused || document.hidden || document.querySelector('dialog[open]')) return;
    heroTimer = window.setTimeout(() => setHeroSlide(activeHeroSlide + 1, false), 8000);
  }

  function setHeroSlide(index, manual = true) {
    if (!heroSlides.length) return;
    activeHeroSlide = ((index % heroStories.length) + heroStories.length) % heroStories.length;
    heroSlides.forEach(slide => {
      const active = Number(slide.dataset.slide) === activeHeroSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    updateHeroControls();
    if (manual && $('hero-status')) {
      $('hero-status').textContent = `${heroStories[activeHeroSlide].kicker}. Slide ${activeHeroSlide + 1} of ${heroStories.length}.`;
    }
    syncHeroTimer();
  }

  $('hero-prev')?.addEventListener('click', () => setHeroSlide(activeHeroSlide - 1));
  $('hero-next')?.addEventListener('click', () => setHeroSlide(activeHeroSlide + 1));
  $('hero-toggle')?.addEventListener('click', () => {
    heroUserPaused = !heroUserPaused;
    updateHeroControls();
    if ($('hero-status')) $('hero-status').textContent = heroUserPaused ? 'Slideshow paused.' : 'Slideshow resumed.';
    syncHeroTimer();
  });
  document.querySelectorAll('[data-hero-slide]').forEach(button => {
    button.addEventListener('click', () => setHeroSlide(Number(button.dataset.heroSlide)));
  });
  hero?.addEventListener('keydown', event => {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setHeroSlide(activeHeroSlide + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
  let heroTouchStart = null;
  hero?.addEventListener('touchstart', event => {
    heroTouchStart = null;
    if (event.touches.length !== 1 || event.target.closest('button, a, input, textarea, select')) return;
    heroTouchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  hero?.addEventListener('touchend', event => {
    if (!heroTouchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - heroTouchStart.x;
    const dy = event.changedTouches[0].clientY - heroTouchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3) setHeroSlide(activeHeroSlide + (dx > 0 ? -1 : 1));
    heroTouchStart = null;
  }, { passive: true });
  hero?.addEventListener('touchcancel', () => { heroTouchStart = null; }, { passive: true });
  document.addEventListener('visibilitychange', syncHeroTimer);

  const siteHeader = $('site-header') || document.querySelector('.site-header');
  function updateHeader() {
    siteHeader?.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  let revealObserver = null;
  const revealElements = [...document.querySelectorAll('.reveal')];
  function configureReveals() {
    revealObserver?.disconnect();
    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      document.body.classList.remove('js-reveal');
      revealElements.forEach(section => section.classList.add('is-visible'));
      return;
    }
    document.body.classList.add('js-reveal');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    revealElements.filter(section => !section.classList.contains('is-visible')).forEach(section => revealObserver.observe(section));
  }
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) heroUserPaused = true;
    updateHeroControls();
    syncHeroTimer();
    configureReveals();
  });
  configureReveals();
  setHeroSlide(0, false);

  const designSelect = $('enquiry-design');
  if (designSelect) {
    designSelect.replaceChildren();
    const exploring = element('option', '', 'Still exploring');
    exploring.value = '';
    designSelect.append(exploring);
    designs.forEach(design => {
      const option = element('option', '', design.name);
      option.value = String(design.id);
      designSelect.append(option);
    });
  }
  if ($('enquiry-submit')) {
    const button = $('enquiry-submit');
    const label = CONTACT_EMAIL ? 'Prepare my enquiry' : 'Create my project brief';
    const textNode = [...button.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
    if (textNode) textNode.textContent = `${label} `;
    else button.prepend(document.createTextNode(`${label} `));
  }
  if ($('enquiry-note')) $('enquiry-note').textContent = CONTACT_EMAIL
    ? 'Prepare an email draft to send to the studio. You can also save a copy of your brief.'
    : 'Create a brief to save or share. Your details stay in this browser; nothing is sent.';

  function openEnquiry(id = '') {
    closeMenu();
    if ($('enquiry-form')) $('enquiry-form').hidden = false;
    if ($('brief-ready')) $('brief-ready').hidden = true;
    if ($('brief-status')) $('brief-status').textContent = '';
    if (designSelect && id) designSelect.value = String(id);
    openDialog(enquiryDialog);
  }
  $('detail-enquire')?.addEventListener('click', () => openEnquiry(currentDesign));
  $('enquiry-close')?.addEventListener('click', () => closeDialog(enquiryDialog));
  $('brief-back')?.addEventListener('click', () => {
    if ($('brief-ready')) $('brief-ready').hidden = true;
    if ($('enquiry-form')) $('enquiry-form').hidden = false;
    $('enquiry-form')?.querySelector('input')?.focus();
  });

  $('enquiry-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const selectedDesign = designs.find(design => String(design.id) === String(data.get('design')));
    briefContent = [
      'P. INTERIORS',
      'PROJECT BRIEF',
      '',
      `Name: ${String(data.get('name') || '').trim()}`,
      `Email: ${String(data.get('email') || '').trim()}`,
      `Design interest: ${selectedDesign?.name || 'Still exploring'}`,
      `Timeline: ${String(data.get('timeline') || 'To be discussed').trim() || 'To be discussed'}`,
      '',
      'ABOUT THE PROJECT',
      String(data.get('project') || '').trim(),
      '',
      'Prepared with P. Interiors. This brief has not been submitted automatically.'
    ].join('\n');
    if ($('brief-text')) $('brief-text').value = briefContent;
    form.hidden = true;
    if ($('brief-ready')) $('brief-ready').hidden = false;
    if ($('brief-status')) $('brief-status').textContent = CONTACT_EMAIL
      ? 'Your email draft is ready to send in your email app. You can also save or copy your brief below.'
      : 'Your brief is ready. Save or copy it to share when you are ready. Nothing has been sent.';
    $('brief-download')?.focus();
    if (CONTACT_EMAIL) {
      const subject = `Project enquiry${selectedDesign ? ` — ${selectedDesign.name}` : ''}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(briefContent)}`;
    }
  });

  $('brief-download')?.addEventListener('click', () => {
    if (!briefContent) return;
    const url = URL.createObjectURL(new Blob([briefContent], { type: 'text/plain;charset=utf-8' }));
    const link = element('a');
    link.href = url;
    link.download = 'P-Interiors-Project-Brief.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if ($('brief-status')) $('brief-status').textContent = 'Your project brief has been saved as a text file. Nothing has been sent.';
  });
  $('brief-copy')?.addEventListener('click', async () => {
    if (!briefContent) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard is not available');
      await navigator.clipboard.writeText(briefContent);
      if ($('brief-status')) $('brief-status').textContent = 'Project brief copied. You can paste it into an email or message.';
    } catch {
      $('brief-text')?.focus();
      $('brief-text')?.select();
      if ($('brief-status')) $('brief-status').textContent = 'Select and copy the brief above using your browser’s copy command.';
    }
  });

  renderCollection();
})();
