const menuPanel = document.getElementById('menuPanel');
const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');

function setMenuOpen(open) {
  menuPanel.classList.toggle('open', open);
  menuPanel.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) menuPanel.querySelector('a').focus();
  else menuToggle.focus();
}

menuToggle.addEventListener('click', () => setMenuOpen(true));
menuClose.addEventListener('click', () => setMenuOpen(false));
menuPanel.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuPanel.classList.contains('open')) {
    setMenuOpen(false);
    return;
  }
  if (event.key !== 'Tab' || !menuPanel.classList.contains('open')) return;

  const focusable = [...menuPanel.querySelectorAll('a[href], button:not(:disabled)')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
