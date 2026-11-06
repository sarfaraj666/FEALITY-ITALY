(() => {
  const filter = document.getElementById('faq-filter');
  const query = document.getElementById('faq-query');
  const sections = filter.closest('article').querySelectorAll('section');
  filter.hidden = false;
  query.addEventListener('input', () => {
    const words = query.value.trim().toLowerCase().split(/\s+/);
    let count = 0;
    for (const section of sections) {
      let matches = 0;
      for (const question of section.querySelectorAll('details')) {
        const text = question.textContent.toLowerCase();
        question.hidden = !words.every(word => text.includes(word));
        if (!question.hidden) matches++;
      }
      section.hidden = matches === 0;
      count += matches;
    }
    document.getElementById('faq-status').textContent = !query.value.trim() ? '' :
      count ? count + (count === 1 ? ' question found.' : ' questions found.') :
      'No matching questions. Try a collection name or a shorter search.';
  });
})();
