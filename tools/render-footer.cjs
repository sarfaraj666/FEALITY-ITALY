// Run with Node after editing the footer. Pages ship complete HTML for static hosting.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

const columns = [
  [['Kitchen', 'kitchen.html'], ['Wardrobes', 'wardrobes.html'], ['Vanity', 'vanity.html']],
  [['About Us', 'about.html'], ['How It Works', 'how-it-works.html']],
  [['FAQs', 'kitchen.html#faqs'], ['Terms &amp; Policies', 'terms-policies.html']]
];

// Set a URL only after the business has approved the profile.
const profiles = [
  ['Facebook', '', '<path d="M14 21v-8h3l.5-4H14V7c0-1 .5-2 2-2h2V2h-3c-3 0-5 2-5 5v2H7v4h3v8z"/>'],
  ['Instagram', '', '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7"/>'],
  ['LinkedIn', '', '<rect x="2" y="2" width="20" height="20" rx="3"/><path d="M7 10v8m0-12v1m4 11v-8m0 4c0-5 6-5 6 0v4"/>'],
  ['Pinterest', '', '<circle cx="12" cy="12" r="10"/><path d="m9 20 3-12m-3 6c-4-7 6-12 8-5 1 5-3 8-6 5"/>'],
  ['YouTube', '', '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z"/>']
];

function renderFooter(page) {
  const groups = columns.map(links => {
    const items = links.map(([label, href]) => {
      const current = href === page ? ' aria-current="page"' : '';
      return `          <li><a href="${href}"${current}>${label}</a></li>`;
    });
    return ['        <ul>', ...items, '        </ul>'].join('\n');
  });
  const icons = profiles.map(([name, url, shape]) => {
    const svg = `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${shape}</svg>`;
    return url
      ? `<a href="${url}" aria-label="FEALITY ITALY on ${name}">${svg}</a>`
      : `<span role="img" aria-label="${name}, profile link unavailable" title="${name} — profile link unavailable">${svg}</span>`;
  });
  const social = icons.length ? `<div class="footer-social"><strong>Follow Us</strong><div>${icons.join('')}</div></div>` : '';
  return `<footer class="site-footer" id="site-footer" aria-label="FEALITY ITALY">
    <div class="site-footer-inner">
      <h2>Talk to Us <a href="tel:+919522251777">9522251777</a></h2>
      <nav aria-label="Footer navigation">
${groups.join('\n')}${social}
      </nav>
    </div>
  </footer>`;
}

for (const page of ['index.html', ...columns.flat().map(([, href]) => href).filter(href => !href.includes('#'))]) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  const footer = /<footer\b[^>]*>[\s\S]*?<\/footer>/g;
  if ((html.match(footer) || []).length !== 1) throw Error(`Expected one footer in ${page}`);
  const newline = html.includes('\r\n') ? '\r\n' : '\n';
  const updated = html.replace(footer, () => renderFooter(page).replaceAll('\n', newline));
  if (updated !== html) fs.writeFileSync(file, updated);
}
