(() => {
  'use strict';

  // The existing gallery hooks are shared by all three collection pages.
  const wardrobeDesigns = window.FealityWardrobeDesigns;
  const vanityDesigns = window.FealityVanityDesigns;
  const balconyDesigns = window.FealityBalconyDesigns;
  const designs = balconyDesigns || vanityDesigns || wardrobeDesigns || window.FealityKitchenDesigns;

  const get = id => document.getElementById(id);
  const grid = get('kitchen-grid');
  if (!grid || !designs?.length) return;
  const filters = get('kitchen-filters');
  const dialog = get('kitchen-lightbox');
  const fullImage = get('kitchen-full-image');
  const status = get('kitchen-image-status');
  const enquiry = get('kitchen-enquire');
  let visible = designs;
  let current = 0;
  let trigger = null;
  let savedOverflow = null;
  let request = 0;
  let swipeStart = null;
  let enquiryHandler = null;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function open(position, button) {
    trigger = button;
    if (savedOverflow === null) savedOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    show(position);
  }

  // One entry point per photograph, with the same lightbox on both layouts.
  function addEditorialCaption(card, design) {
    const title = design.name || `Kitchen Design ${design.id}`;
    const summary = element('span', 'design-summary');
    summary.hidden = true; // The phone stylesheet reveals this caption.
    const heading = element('span', 'design-name', title);
    summary.append(heading);
    const desktopHeading = card.querySelector('.model-title, .kitchen-gallery-caption > span:first-child');
    for (const node of [heading, desktopHeading].filter(Boolean)) {
      const text = node.textContent;
      // Separate the model from its category or the two features in a descriptive title.
      const feature = text.match(/^(.+? (?:and|with) )(.+)$/);
      const numbered = text.match(/^(.+? )(Design \d+)$/);
      const pair = feature || numbered;
      const wardrobe = wardrobeDesigns && text.match(/^(.+?)\s+(?:Wardrobe|WARDROBE)$/i);
      const vanity = vanityDesigns && text.match(/^(.+?)\s+(?:Vanity|VANITY)$/i);
      const balcony = balconyDesigns && text.match(/^(.+?)\s*(?:-\s*)?(?:Balcony|BALCONY)$/i);
      if (pair) node.replaceChildren(pair[1], element('span', 'design-emphasis', pair[2]));
      else if (wardrobe) {
        node.replaceChildren(wardrobe[1], ' ', element('span', 'design-emphasis wardrobe-emphasis', 'Wardrobe'));
      }
      else if (vanity) {
        node.replaceChildren(vanity[1], ' ', element('span', 'design-emphasis vanity-emphasis', 'Vanity'));
      }
      else if (balcony) {
        node.replaceChildren(balcony[1], ' ', element('span', 'design-emphasis balcony-emphasis', 'Balcony'));
      }
      else if (wardrobeDesigns && design.name) {
        node.append(' ', element('span', 'design-emphasis wardrobe-emphasis', 'Wardrobe'));
      }
      else if (vanityDesigns && design.name) {
        node.append(' ', element('span', 'design-emphasis vanity-emphasis', 'Vanity'));
      }
      else if (balconyDesigns && design.name) {
        node.append(' ', element('span', 'design-emphasis balcony-emphasis', 'Balcony'));
      }
      else if (!balconyDesigns && !wardrobeDesigns && !vanityDesigns && design.name) {
        node.append(' ', element('span', 'design-emphasis', 'Kitchen'));
      }
    }
    const description = design.description || card.querySelector('.collection-subtitle')?.textContent
      || card.querySelector('img').alt;
    if (description && description.toLowerCase() !== title.toLowerCase()) {
      summary.append(element('span', 'design-note', description));
    }
    summary.append(element('span', 'design-action', 'Explore Design →'));
    card.prepend(summary);
    card.classList.add('editorial-design');
    // Some desktop detail cards have an existing numbered title as well.
    const existingTitle = card.querySelector('.kitchen-gallery-caption > span')?.textContent;
    const label = existingTitle && existingTitle !== heading.textContent
      ? `${heading.textContent} (${existingTitle})` : heading.textContent;
    card.setAttribute('aria-label', `Explore Design: ${label}`);
  }

  document.querySelectorAll('.collection-section button[data-collection-design]').forEach(card => {
    const design = designs.find(item => item.id === card.dataset.collectionDesign);
    if (design) addEditorialCaption(card, design);
  });

  // Featured and editorial cards open the complete collection, independently of filters.
  // Delegation also supports cards rendered by the existing Kitchen carousel.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-collection-design], [data-vanity-design]');
    if (!button || event.defaultPrevented) return;
    const id = button.dataset.collectionDesign || button.dataset.vanityDesign;
    const position = designs.findIndex(design => design.id === id);
    if (position < 0) return;
    event.preventDefault();
    if (visible.length !== designs.length) render('All Designs');
    open(position, button);
  });

  function render(category) {
    visible = designs.filter(design => category === 'All Designs' || design.category === category);
    filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.textContent === category)));
    const fragment = document.createDocumentFragment();
    visible.forEach((design, position) => {
      const button = element('button', 'kitchen-gallery-card');
      button.type = 'button';
      // Narrow compositions include vertical cabinetry and close-up storage details.
      if (design.width / design.height < 1.6) button.classList.add('catalogue-inset');
      const title = design.name || `Kitchen Design ${design.id}`;
      button.setAttribute('aria-haspopup', 'dialog');
      const media = element('span', 'kitchen-gallery-media');
      const img = element('img');
      Object.assign(img, { src: design.thumbnail, srcset: design.srcset,
        sizes: 'auto, (max-width: 768px) 88vw, 100vw',
        width: design.width, height: design.height, alt: design.alt, loading: 'lazy', decoding: 'async' });
      if (design.width > 960) img.srcset += `, ${design.source} ${design.width}w`;
      media.append(img);
      const caption = element('span', 'kitchen-gallery-caption');
      caption.append(element('span', '', title));
      const arrow = element('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      caption.append(arrow);
      button.append(media, caption);
      addEditorialCaption(button, design);
      button.dataset.galleryPosition = position;
      fragment.append(button);
    });
    grid.replaceChildren(fragment);
    get('kitchen-count').textContent = `${visible.length} ${visible.length === 1 ? 'design' : 'designs'}`;
  }

  grid.addEventListener('click', event => {
    const card = event.target.closest('[data-gallery-position]');
    if (card) open(Number(card.dataset.galleryPosition), card);
  });

  async function show(position) {
    current = (position + visible.length) % visible.length;
    const design = visible[current];
    const token = ++request;
    get('kitchen-counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    const description = [design.description, design.details].filter(Boolean).join('\n\n');
    const descEl = get('kitchen-description');
    if (descEl) {
      descEl.textContent = description || '';
      descEl.hidden = !description;
    }
    const nameEl = get('kitchen-design-name');
    if (nameEl) {
      const fallback = balconyDesigns ? `Balcony Design ${design.id}` : wardrobeDesigns ? `Wardrobe Design ${design.id}` : vanityDesigns ? `Vanity Design ${design.id}` : `Kitchen Design ${design.id}`;
      const rawName = design.name || fallback;
      const wardrobeMatch = wardrobeDesigns && rawName.match(/^(.+?)\s+(?:Wardrobe|WARDROBE)$/i);
      const vanityMatch = vanityDesigns && rawName.match(/^(.+?)\s+(?:Vanity|VANITY)$/i);
      const balconyMatch = balconyDesigns && rawName.match(/^(.+?)\s*(?:-\s*)?(?:Balcony|BALCONY)$/i);
      if (wardrobeMatch) {
        nameEl.replaceChildren(wardrobeMatch[1], ' ', element('span', 'design-emphasis wardrobe-emphasis', 'Wardrobe'));
        nameEl.hidden = false;
      } else if (vanityMatch) {
        nameEl.replaceChildren(vanityMatch[1], ' ', element('span', 'design-emphasis vanity-emphasis', 'Vanity'));
        nameEl.hidden = false;
      } else if (balconyMatch) {
        nameEl.replaceChildren(balconyMatch[1], ' ', element('span', 'design-emphasis balcony-emphasis', 'Balcony'));
        nameEl.hidden = false;
      } else if (!balconyDesigns && !wardrobeDesigns && !vanityDesigns && design.name) {
        nameEl.replaceChildren(design.name, ' ', element('span', 'design-emphasis', 'Kitchen'));
        nameEl.hidden = false;
      } else {
        nameEl.textContent = rawName;
        nameEl.hidden = !rawName;
      }
    }
    get('kitchen-previous').disabled = get('kitchen-next').disabled = visible.length < 2;
    fullImage.classList.add('is-loading');
    status.textContent = 'Loading image…';
    const image = new Image();
    image.src = design.source;
    try {
      await image.decode();
      if (token !== request || !dialog.open) return;
      fullImage.src = design.source;
      fullImage.alt = design.alt;
      fullImage.width = design.width;
      fullImage.height = design.height;
      status.textContent = '';
      dialog.setAttribute('aria-labelledby', 'kitchen-lightbox-title kitchen-design-name');
      fullImage.classList.remove('is-loading');
    } catch {
      if (token === request && dialog.open) status.textContent = 'This image could not be loaded. Please try another image.';
    }
  }

  ['All Designs', 'Modern', 'Classic', 'Contemporary'].forEach(category => {
    if (category !== 'All Designs' && !designs.some(design => design.category === category)) return;
    const button = element('button', '', category);
    button.type = 'button';
    button.setAttribute('aria-controls', 'kitchen-grid');
    button.addEventListener('click', () => render(category));
    filters.append(button);
  });
  get('kitchen-close').addEventListener('click', () => dialog.close());
  get('kitchen-previous').addEventListener('click', () => show(current - 1));
  get('kitchen-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('close', () => {
    // A queued close event may arrive after the viewer has reopened.
    if (dialog.open) return;
    ++request;
    swipeStart = null;
    document.body.style.overflow = savedOverflow;
    savedOverflow = null;
    trigger?.focus({ preventScroll: true });
  });
  // Native modal dialog supplies background inertness and Escape-to-close.
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dialog.close();
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')]
        .filter(node => !node.hidden);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  const stage = get('kitchen-stage');
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary) { swipeStart = null; return; }
    if (event.button !== 0) return;
    swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
    stage.setPointerCapture(event.pointerId);
  });
  stage.addEventListener('pointerup', event => {
    if (!swipeStart || swipeStart.id !== event.pointerId) return;
    const dx = event.clientX - swipeStart.x, dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  });
  for (const type of ['pointercancel', 'lostpointercapture']) {
    stage.addEventListener(type, () => { swipeStart = null; });
  }

  // Future shared modal integration:
  // FealityKitchenGallery.setEnquiryHandler(design => sharedEnquiry.open(design));
  // The handler receives the chosen design after this viewer closes and restores focus.
  const galleryHook = balconyDesigns ? "FealityBalconyGallery" : vanityDesigns ? 'FealityVanityGallery' : wardrobeDesigns ? 'FealityWardrobeGallery' : 'FealityKitchenGallery';
  window[galleryHook] = Object.freeze({
    setEnquiryHandler(handler) {
      enquiryHandler = typeof handler === 'function' ? handler : null;
    }
  });
  enquiry.addEventListener('click', event => {
    if (!enquiryHandler) return;
    event.preventDefault();
    const handler = enquiryHandler, design = { ...visible[current] };
    dialog.addEventListener('close', () => handler(design), { once: true });
    dialog.close();
  });
  render('All Designs');
  const requestedId = new URLSearchParams(location.search).get('design');
  const requestedIndex = designs.findIndex(design => design.id === requestedId);
  if (requestedIndex >= 0) open(requestedIndex, grid.children[requestedIndex]);
})();
