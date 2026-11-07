// Run with Node after editing the footer. Pages ship complete HTML for static hosting.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

const columns = [
  [['Home', 'index.html'], ['Exclusive Kitchen', 'kitchen.html'], ['Wardrobes', 'wardrobes.html'], ['Vanity', 'vanity.html']],
  [['About Us', 'about.html'], ['How It Works', 'how-it-works.html']],
  [['FAQs', 'faqs.html'], ['Terms &amp; Policies', 'terms-policies.html']]
];

function renderFooter(page) {
  const groups = columns.map(links => {
    const items = links.map(([label, href]) => {
      const current = href === page ? ' aria-current="page"' : '';
      return `          <li><a href="${href}"${current}>${label}</a></li>`;
    });
    return ['        <ul>', ...items, '        </ul>'].join('\n');
  });
  return `<footer class="site-footer" id="site-footer" aria-label="FEALITY ITALY">
    <div class="site-footer-inner">
      <h2>Talk to Us <a href="tel:+919522251777">9522251777</a></h2>
      <nav aria-label="Footer navigation">
${groups.join('\n')}
      </nav>
      <div class="footer-colophon"><small>© 2026 FEALITY ITALY. All Rights Reserved.</small></div>
    </div>
  </footer>`;
}

for (const page of columns.flat().map(([, href]) => href)) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  const footer = /<footer\b[^>]*>[\s\S]*?<\/footer>/g;
  if ((html.match(footer) || []).length !== 1) throw Error(`Expected one footer in ${page}`);
  const newline = html.includes('\r\n') ? '\r\n' : '\n';
  const updated = html.replace(footer, () => renderFooter(page).replaceAll('\n', newline));
  if (updated !== html) fs.writeFileSync(file, updated);
}
