(() => {
  'use strict';
  const config = window.FealityEnquiryConfig;
  if (!config) return;
  const collections = {
    Kitchen: ['FealityKitchenDesigns', 'FealityKitchenGallery'],
    Wardrobes: ['FealityWardrobeDesigns', 'FealityWardrobeGallery'],
    Vanity: ['FealityVanityDesigns', 'FealityVanityGallery'],
    Balcony: ['FealityBalconyDesigns', 'FealityBalconyGallery']
  };
  // Leave the existing isolated gateway test harness in control on its own port.
  if (location.hostname === '127.0.0.1' && location.port === '8184') return;
  for (const [collection, [, hook]] of Object.entries(collections)) {
    window[hook]?.setEnquiryHandler(design => {
      location.href = `contact.html?${new URLSearchParams({ collection, design: design.id })}`;
    });
  }
  document.querySelectorAll('[data-customer-enquiry], .contact-form, .studio-enquiry').forEach(form => {
    const status = document.createElement('p');
    status.className = 'enquiry-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
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
        collection: collectionSelect?.value || 'Studio partnership', designId: value('designId'),
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
      busy = true; button.disabled = true; status.textContent = 'Sending your enquiry…';
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 45000);
      try {
        const response = await fetch(config.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...payload, requestId }), signal: controller.signal, credentials: 'omit', redirect: 'follow' });
        const result = await response.json();
        if (!response.ok || result.saved !== true || !/^FE-[a-f0-9-]{36}$/.test(result.id)) throw new Error('Unconfirmed');
        status.textContent = `Thank you. Your enquiry has been received. Reference: ${result.id}`;
        // Keep this ID for repeated clicks with unchanged details. A genuine edit
        // generates a new ID above; a lost response can safely be retried.
      } catch (_) {
        status.textContent = 'We could not confirm receipt. Your details are still here; please retry or call 9522251777. Retrying will not create a duplicate enquiry.';
      } finally { clearTimeout(timeout); busy = false; button.disabled = false; }
    });
  });
})();
