// Extends the existing search results on interior pages using the gallery records.
(() => {
  const input = document.getElementById('siteSearch');
  const results = document.getElementById('searchResults');
  if (!input || !results) return;
  const collections = [
    ['Kitchen', 'kitchen', 'kitchen-data.js', 'FealityKitchenDesigns'],
    ['Wardrobes', 'wardrobes', 'wardrobe-data.js', 'FealityWardrobeDesigns'],
    ['Vanity', 'vanity', 'vanity-data.js', 'FealityVanityDesigns']
  ];
  let loading;
  // A catalogue result enters a modal, so only this departure opts out of
  // the cross-document reveal. Normal page links keep their transition.
  results.addEventListener('click', event => {
    const link = event.target.closest('a[data-design-result]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey ||
        event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const style = document.createElement('style');
    style.textContent = '@view-transition { navigation: none; }';
    document.head.append(style);
    window.addEventListener('pageshow', () => style.remove(), { once: true });
    requestAnimationFrame(() => requestAnimationFrame(() => location.assign(link.href)));
  });
  function catalog() {
    return loading ||= Promise.all(collections.map(([, , source, key]) => {
      if (window[key]) return;
      return new Promise(resolve => {
        const script = document.createElement('script');
        script.src = source;
        script.onload = script.onerror = resolve;
        document.head.append(script);
      });
    }));
  }
  input.addEventListener('focus', catalog, { once: true });
  let revision = 0;
  input.addEventListener('input', async () => {
    const version = ++revision;
    const query = input.value.toLowerCase().trim();
    if (!query) return;
    await catalog();
    if (version !== revision) return;
    const fragment = document.createDocumentFragment();
    for (const [label, route, , key] of collections) {
      for (const design of window[key] || []) {
        const title = design.name || ('Kitchen Design ' + design.id);
        if (!(label + ' Design ' + design.id + ' ' + title + ' ' + design.alt).toLowerCase().includes(query)) continue;
        const link = document.createElement('a');
        link.dataset.designResult = '';
        link.href = route + '.html?design=' + encodeURIComponent(design.id) + '#kitchen-gallery';
        link.append(title);
        const category = document.createElement('span');
        category.textContent = label + ' ↗';
        link.append(category);
        fragment.append(link);
      }
    }
    if (fragment.childElementCount) {
      results.querySelector('.search-empty')?.remove();
      results.append(fragment);
    }
  });
})();
