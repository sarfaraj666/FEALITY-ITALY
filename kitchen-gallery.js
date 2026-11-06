(() => {
  'use strict';

  // The existing gallery hooks are shared by all three collection pages.
  const wardrobeDesigns = window.FealityWardrobeDesigns;
  const vanityDesigns = window.FealityVanityDesigns;
  const designs = vanityDesigns || wardrobeDesigns || window.FealityKitchenDesigns;

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
  let savedOverflow = '';
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
    savedOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    show(position);
  }

  // Featured and editorial cards open the complete collection, independently of filters.
  // Delegation also supports cards rendered by the existing Kitchen carousel.
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-collection-design], [data-vanity-design]');
    if (!button || event.defaultPrevented) return;
    const id = button.dataset.collectionDesign || button.dataset.vanityDesign;
    const position = designs.findIndex(design => design.id === id);
    if (position < 0) return;
    event.preventDefault();
    render('All Designs');
    open(position, button);
  });

  function render(category) {
    visible = designs.filter(design => category === 'All Designs' || design.category === category);
    filters.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.textContent === category)));
    const fragment = document.createDocumentFragment();
    visible.forEach((design, position) => {
      const button = element('button', 'kitchen-gallery-card');
      button.type = 'button';
      button.setAttribute('aria-label', `View ${design.name || design.alt}`);
      button.setAttribute('aria-haspopup', 'dialog');
      const media = element('span', 'kitchen-gallery-media');
      const img = element('img');
      Object.assign(img, { src: design.thumbnail, srcset: design.srcset,
        sizes: '(max-width: 600px) 88vw, (max-width: 900px) 43vw, 29vw',
        width: design.width, height: design.height, alt: design.alt, loading: 'lazy', decoding: 'async' });
      media.append(img);
      const caption = element('span', 'kitchen-gallery-caption');
      caption.append(element('span', '', design.name || `Kitchen Design ${design.id}`));
      const arrow = element('span', '', '↗');
      arrow.setAttribute('aria-hidden', 'true');
      caption.append(arrow);
      button.append(media, caption);
      button.addEventListener('click', () => open(position, button));
      fragment.append(button);
    });
    grid.replaceChildren(fragment);
    get('kitchen-count').textContent = `${visible.length} ${visible.length === 1 ? 'design' : 'designs'}`;
  }

  async function show(position) {
    current = (position + visible.length) % visible.length;
    const design = visible[current];
    const token = ++request;
    get('kitchen-counter').textContent = `${String(current + 1).padStart(2, '0')} / ${String(visible.length).padStart(2, '0')}`;
    for (const [id, value] of [['kitchen-design-name', design.name || `Kitchen Design ${design.id}`], ['kitchen-description', design.description]]) {
      get(id).textContent = value || '';
      get(id).hidden = !value;
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
    ++request;
    swipeStart = null;
    document.body.style.overflow = savedOverflow;
    trigger?.focus({ preventScroll: true });
  });
  // Native modal dialog supplies background inertness and Escape-to-close.
  dialog.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      show(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Tab') {
      const buttons = [...dialog.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons[buttons.length - 1];
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
  const galleryHook = vanityDesigns ? 'FealityVanityGallery' : wardrobeDesigns ? 'FealityWardrobeGallery' : 'FealityKitchenGallery';
  window[galleryHook] = Object.freeze({
    setEnquiryHandler(handler) {
      enquiryHandler = typeof handler === 'function' ? handler : null;
      enquiry.disabled = !enquiryHandler;
      get('kitchen-enquiry-note').hidden = !!enquiryHandler;
    }
  });
  enquiry.addEventListener('click', () => {
    if (!enquiryHandler) return;
    const handler = enquiryHandler, design = { ...visible[current] };
    dialog.addEventListener('close', () => handler(design), { once: true });
    dialog.close();
  });
  render('All Designs');
  const requestedId = new URLSearchParams(location.search).get('design');
  const requestedIndex = designs.findIndex(design => design.id === requestedId);
  if (requestedIndex >= 0) open(requestedIndex, grid.children[requestedIndex]);
})();
