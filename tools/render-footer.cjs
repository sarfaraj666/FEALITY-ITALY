// Run with Node after editing the footer. Pages ship complete HTML for static hosting.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

const columns = [
  [['About Us', 'about.html'], ['Kitchen', 'kitchen.html'], ['Wardrobes', 'wardrobes.html'], ['Vanity', 'vanity.html']],
  [['FAQs', 'faqs.html'], ['How It Works', 'how-it-works.html']],
  [['Terms &amp; Policies', 'terms-policies.html']],
  [['Back to Top <span aria-hidden="true">↑</span>', '#top']]
];

function renderFooter(page) {
  const groups = columns.map(links => {
    const items = links.map(([label, href]) => {
      const current = href === page ? ' aria-current="page"' : '';
      return `          <li><a href="${href}"${current}>${label}</a></li>`;
    });
    return ['        <ul>', ...items, '        </ul>'].join('\n');
  });
  const years = page === 'kitchen.html' ? '2010–2026' : '2026';
  return `<footer class="site-footer" id="site-footer" aria-label="FEALITY ITALY">
    <div class="site-footer-inner">
      <h2>Talk to us</h2>
      <nav aria-label="Footer navigation">
${groups.join('\n')}
      </nav>
      <small>© ${years} <a href="index.html">FEALITY ITALY</a>. All Rights Reserved.</small>
    </div>
  </footer>`;
}

for (const page of ['index.html', ...columns.flat().map(link => link[1]).filter(href => href.endsWith('.html'))]) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  const footer = /<footer\b[^>]*>[\s\S]*?<\/footer>/g;
  if ((html.match(footer) || []).length !== 1) throw Error(`Expected one footer in ${page}`);
  const newline = html.includes('\r\n') ? '\r\n' : '\n';
  const updated = html.replace(footer, () => renderFooter(page).replaceAll('\n', newline));
  if (updated !== html) fs.writeFileSync(file, updated);
}
