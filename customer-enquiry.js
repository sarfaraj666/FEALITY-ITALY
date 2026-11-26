(() => {
  'use strict';
  const config = window.FealityEnquiryConfig;
  if (!config) return;
  const acceptedEmailTlds = new Set([
    'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'info', 'biz', 'name', 'pro',
    'aero', 'coop', 'museum', 'travel', 'jobs', 'mobi', 'asia', 'cat', 'tel', 'post',
    'app', 'dev', 'tech', 'online', 'site', 'store', 'design', 'studio', 'agency',
    'space', 'shop', 'website', 'live', 'world', 'solutions', 'company', 'business',
    'group', 'services', 'digital', 'global', 'in', 'co.in', 'org.in', 'net.in',
    'firm.in', 'gen.in', 'ind.in', 'ac.in', 'edu.in', 'gov.in', 'co.uk', 'org.uk',
    'net.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'co.za', 'co.sg'
  ]);
  function isPlausibleEmail(value) {
    if (!value) return true;
    const parts = value.trim().split('@');
    if (parts.length !== 2 || !/^[a-z0-9._%+-]+$/i.test(parts[0])) return false;
    const domain = parts[1].toLowerCase();
    if (!/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) return false;
    const labels = domain.split('.');
    const suffix2 = labels.slice(-2).join('.');
    const tld = labels[labels.length - 1];
    return acceptedEmailTlds.has(suffix2) || acceptedEmailTlds.has(tld) || /^[a-z]{2}$/.test(tld);
  }
  function showSuccessPopup() {
    document.querySelector('.enquiry-success-dialog')?.remove();
    const dialog = document.createElement('dialog');
    dialog.className = 'enquiry-success-dialog';
    dialog.setAttribute('aria-labelledby', 'enquiry-success-title');
    dialog.setAttribute('aria-describedby', 'enquiry-success-description');
    dialog.innerHTML = '<div class="enquiry-success-mark" aria-hidden="true">✓</div><p class="enquiry-success-brand">FEALITY ITALY</p><h2 id="enquiry-success-title">Thank you!</h2><p id="enquiry-success-description">Your enquiry has been received successfully.<br>Our team will contact you soon.</p><button type="button" autofocus>Done</button>';
    document.body.append(dialog);
    dialog.querySelector('button').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
    dialog.addEventListener('close', () => dialog.remove(), { once: true });
    dialog.showModal();
  }
  const collections = {
    Kitchen: ['FealityKitchenDesigns', 'FealityKitchenGallery'],
    Wardrobes: ['FealityWardrobeDesigns', 'FealityWardrobeGallery'],
    Vanity: ['FealityVanityDesigns', 'FealityVanityGallery'],
    Balcony: ['FealityBalconyDesigns', 'FealityBalconyGallery']
  };
  const collectionPages = {
    Kitchen: 'kitchen.html', Wardrobes: 'wardrobes.html', Vanity: 'vanity.html', Balcony: 'balcony.html'
  };
  function openPageEnquiry(collection, design) {
    const form = document.querySelector('[data-customer-enquiry], .contact-form');
    const collectionSelect = form?.querySelector('[name="collection"], [name="interest"]');
    const designSelect = form?.querySelector('[name="designId"]');
    if (!form || !collectionSelect || !designSelect) {
      location.href = `${collectionPages[collection]}?${new URLSearchParams({ collection, design: design.id })}#kitchen-enquiry-section`;
      return;
    }
    collectionSelect.value = collection;
    collectionSelect.dispatchEvent(new Event('change', { bubbles: true }));
    designSelect.value = design.id;
    designSelect.dispatchEvent(new Event('change', { bubbles: true }));
    const query = new URLSearchParams({ collection, design: design.id });
    history.replaceState(null, '', `${location.pathname}?${query}#kitchen-enquiry-section`);
    document.getElementById('kitchen-enquiry-section')?.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'
    });
    setTimeout(() => form.querySelector('input:not([type="hidden"])')?.focus({ preventScroll: true }), 450);
  }
  for (const [collection, [, hook]] of Object.entries(collections)) {
    window[hook]?.setEnquiryHandler(design => openPageEnquiry(collection, design));
  }
  document.querySelectorAll('[data-customer-enquiry], .contact-form, .studio-enquiry').forEach(form => {
    const emailInput = form.querySelector('input[type="email"]');
    if (emailInput) {
      const validateEmail = () => emailInput.setCustomValidity(
        isPlausibleEmail(emailInput.value.trim()) ? '' : 'Enter a valid email address with a recognized domain.'
      );
      emailInput.addEventListener('input', validateEmail);
      emailInput.addEventListener('blur', validateEmail);
      validateEmail();
    }
    const status = document.createElement('p');
    status.className = 'enquiry-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.tabIndex = -1;
    form.append(status);
    const trap = document.createElement('input');
    trap.name = 'website'; trap.tabIndex = -1; trap.autocomplete = 'off';
    trap.className = 'enquiry-trap'; trap.setAttribute('aria-hidden', 'true');
    form.append(trap);
    const collectionSelect = form.querySelector('[name="collection"], [name="interest"]');
    const designSelect = form.querySelector('[name="designId"]');
    const details = form.querySelector('[data-product-details]');
    function updateDetails() {
      const design = (window[collections[collectionSelect?.value]?.[0]] || []).find(d => d.id === designSelect?.value);
      if (details) details.textContent = design ? `${design.name} — ${design.description}` : '';
    }
    function updateDesigns() {
      if (!designSelect) return;
      designSelect.replaceChildren(new Option('Help me choose', ''));
      for (const item of window[collections[collectionSelect.value]?.[0]] || []) designSelect.add(new Option(item.name, item.id));
      updateDetails();
    }
    if (collectionSelect) {
      const query = new URLSearchParams(location.search);
      const defaultCollection = ({'kitchen.html':'Kitchen','wardrobes.html':'Wardrobes','vanity.html':'Vanity','balcony.html':'Balcony'})[location.pathname.split('/').pop()];
      const selected = query.get('collection') || defaultCollection;
      if ([...collectionSelect.options].some(o => o.value === selected)) collectionSelect.value = selected;
      updateDesigns();
      if (designSelect && [...designSelect.options].some(o => o.value === query.get('design'))) designSelect.value = query.get('design');
      updateDetails();
      collectionSelect.addEventListener('change', updateDesigns);
      designSelect?.addEventListener('change', updateDetails);
    }
    let requestId = crypto.randomUUID(), lastPayload = '', busy = false;
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !form.reportValidity()) return;
      // Read fields directly; legacy formdata handlers must not rewrite this payload.
      const value = name => form.querySelector(`[name="${name}"]`)?.value.trim() || '';
      const payload = {
        name: value('name') || value('fullName'), phone: value('phone'), email: value('email'), city: value('city'),
        collection: form.dataset.enquiryCollection || collectionSelect?.value || 'Studio partnership', designId: value('designId'),
        message: value('message'), budget: value('budget'), consent: !!form.querySelector('input[type="checkbox"]:checked'),
        website: value('website'), page: location.pathname.split('/').pop() || 'index.html'
      };
      if (!/^[+\d ()-]{7,25}$/.test(payload.phone) || payload.phone.replace(/\D/g, '').length < 7) {
        status.textContent = 'Please enter a valid phone number.'; form.querySelector('[name="phone"]').focus(); return;
      }
      if (!config.endpoint) {
        status.replaceChildren(document.createTextNode('Online enquiries are being connected. Please contact us directly: '));
        const link = document.createElement('a');
        link.href = `mailto:${config.email}?subject=${encodeURIComponent('FEALITY ITALY enquiry')}&body=${encodeURIComponent([payload.name, payload.phone, payload.city, payload.collection, details?.textContent, payload.message].filter(Boolean).join('\n'))}`;
        link.textContent = 'Email FEALITY ITALY'; status.append(link); return;
      }
      const signature = JSON.stringify(payload);
      if (lastPayload && signature !== lastPayload) requestId = crypto.randomUUID();
      lastPayload = signature;
      const button = form.querySelector('[type="submit"]');
      const buttonContent = button.innerHTML;
      status.dataset.state = 'sending';
      form.setAttribute('aria-busy', 'true');
      button.textContent = 'Sending…';
      busy = true; button.disabled = true; status.textContent = 'Sending your enquiry…';
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 45000);
      try {
        let response;
        try {
          response = await fetch(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...payload, requestId }), signal: controller.signal, credentials: 'omit', redirect: 'follow' });
        } catch (fetchErr) {
          if (config.fallbackEndpoint && config.fallbackEndpoint !== config.endpoint) {
            response = await fetch(config.fallbackEndpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...payload, requestId }), signal: controller.signal, credentials: 'omit', redirect: 'follow' });
          } else {
            throw fetchErr;
          }
        }
        if (!response.ok && config.fallbackEndpoint && config.fallbackEndpoint !== config.endpoint) {
          response = await fetch(config.fallbackEndpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...payload, requestId }), signal: controller.signal, credentials: 'omit', redirect: 'follow' });
        }
        const result = await response.json();
        if (!response.ok || result.saved !== true || !/^FE-[a-f0-9-]{32,36}$/.test(result.id)) throw new Error('Unconfirmed');
        status.dataset.state = 'success';
        status.textContent = '✓ Thank you! Your enquiry has been received successfully. Our team will contact you soon.';
        status.focus({ preventScroll: true });
        status.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
        showSuccessPopup();
        // Keep this ID for repeated clicks with unchanged details. A genuine edit
        // generates a new ID above; a lost response can safely be retried.
      } catch (_) {
        status.dataset.state = 'error';
        status.textContent = 'We could not confirm receipt. Your details are still here; please retry or call 9522251777. Retrying will not create a duplicate enquiry.';
        status.focus({ preventScroll: true });
      } finally { clearTimeout(timeout); busy = false; button.disabled = false; button.innerHTML = buttonContent; form.removeAttribute('aria-busy'); }
    });
  });
})();
