const images = {
  kora: 'https://arclinea.com/dw/image/v2/BFXX_PRD/on/demandware.static/-/Library-Sites-Arclinea-contentlib/default/dw4797c032/HOMEPAGE/Arclinea%20kitchen%20Kora%20luxury%20interior%20with%20marble%20island%20and%20panoramic%20windows_D.jpeg?bgcolor=FFFFFF&sw=1920',
  italia: 'https://arclinea.com/dw/image/v2/BFXX_PRD/on/demandware.static/-/Library-Sites-Arclinea-contentlib/default/dw41f84ba2/5_COLLECTION/PDP%20ITALIA%20DUBLE%20ISLAND/Italia%20kitchen%20double%20island%20Arclinea%20handle%20D.jpeg?bgcolor=FFFFFF&sw=1600',
  wood: 'https://img.edilportale.com/csmartnews/img/855974_01.jpg',
  proxima: 'https://luminaire.com/cdn/shop/files/Proxima-Kitchen-Antonio-Citterio-Arclinea-4-01.jpg?v=1768586747',
  artusi: 'https://mats01s1.blob.core.windows.net/cache/6/e/a/e/9/c/6eae9c9c988a29b5b24cfc02580c9e5e6d44bf36.jpeg',
  space: 'https://www.cuinespalafrugell.cat/images/contenidos/1-1.jpeg',
  storage: 'https://arclinea.com/on/demandware.static/-/Library-Sites-Arclinea-contentlib/default/dw40cd6d49/9_EXCLUSIVE%20ELEMENTS/DIVISION%20SYSTEM/NEW%20POKCET%20SYSTEM/EE_Division_system_new_pocket_system_15.jpeg',
  island: 'https://static-land.edilportale.com/787691/uploads/M_1920w_21_787690.jpg'
};
const items = [
  {name:'THEA, BORGOGNA FRAME',image:images.artusi},
  {name:'KORA',image:images.kora},
  {name:'LIGNUM ET LAPIS',image:images.wood},
  {name:'CONVIVIUM',image:images.space},
  {name:'PROXIMA',image:images.proxima},
  {name:'ITALIA',image:images.italia},
  {name:'PRINCIPIA',image:images.storage},
  {name:'BETA',image:images.island},
  {name:'THEA',image:images.artusi}
];
const categories = ['WORKTOPS AND TABLES','DIVISION SYSTEMS','STORAGE SYSTEMS','CHAIRS AND STOOLS','EQUIPMENT','FUME EXTRACTION','MATERIALS AND FINISHES'];
const track = document.getElementById('collectionTrack');
const viewport = document.getElementById('collectionViewport');
const pagination = document.getElementById('collectionPagination');
const slideCounter = document.getElementById('slideCounter');
const desktopPrevious = document.getElementById('prevSlide');
const desktopNext = document.getElementById('nextSlide');
const mobilePrevious = document.getElementById('mobilePrev');
const mobileNext = document.getElementById('mobileNext');
track.innerHTML = items.map((item, position) => `<article class="collection-card"><a href="#showroom" aria-label="Explore ${item.name}"><div class="card-image"><img src="${item.image}" alt="${item.name} kitchen collection" width="1600" height="1000" loading="${position < 4 ? 'eager' : 'lazy'}" decoding="async"></div><div class="collection-caption"><h3>${item.name}</h3><span aria-hidden="true">↗</span></div></a></article>`).join('');
let index = 0;
let pageStarts = [];
function visibleCount() {
  return window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 4;
}
function updateCarousel() {
  const card = track.querySelector('.collection-card');
  if (!card) return;
  const count = visibleCount();
  const maximum = Math.max(0, items.length - count);
  index = Math.max(0, Math.min(index, maximum));
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  track.style.transform = `translateX(-${index * (card.getBoundingClientRect().width + gap)}px)`;
  slideCounter.textContent = `${String(index + 1).padStart(2, '0')} — ${String(Math.min(items.length, index + count)).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  [desktopPrevious, mobilePrevious].forEach(button => { button.disabled = index === 0; });
  [desktopNext, mobileNext].forEach(button => { button.disabled = index === maximum; });
  pageStarts = [];
  for (let start = 0; start <= maximum; start += count) pageStarts.push(start);
  if (pageStarts[pageStarts.length - 1] !== maximum) pageStarts.push(maximum);
  pagination.innerHTML = pageStarts.map((start, page) => `<button type="button" data-page-start="${start}" aria-label="Show collection items ${start + 1} to ${Math.min(items.length, start + count)}" aria-pressed="${index >= start && (page === pageStarts.length - 1 || index < pageStarts[page + 1])}"></button>`).join('');
  pagination.querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    index = Number(button.dataset.pageStart);
    updateCarousel();
  }));
}
function next() { index += 1; updateCarousel(); }
function previous() { index -= 1; updateCarousel(); }
document.getElementById('nextSlide').addEventListener('click', next);
document.getElementById('mobileNext').addEventListener('click', next);
document.getElementById('prevSlide').addEventListener('click', previous);
document.getElementById('mobilePrev').addEventListener('click', previous);
window.addEventListener('resize', updateCarousel);
updateCarousel();

let pointerStart = null;
let suppressCardClick = false;
viewport.addEventListener('pointerdown', event => {
  if (event.pointerType === 'touch') pointerStart = {x:event.clientX, y:event.clientY};
});
viewport.addEventListener('pointerup', event => {
  if (!pointerStart) return;
  const deltaX = event.clientX - pointerStart.x;
  const deltaY = event.clientY - pointerStart.y;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
    suppressCardClick = true;
    deltaX < 0 ? next() : previous();
  }
  pointerStart = null;
});
viewport.addEventListener('pointercancel', () => { pointerStart = null; });
viewport.addEventListener('click', event => {
  if (suppressCardClick) {
    event.preventDefault();
    suppressCardClick = false;
  }
}, true);

const heroSlides = [
  {name:'KORA',title:'KORA, THE CURVE<br>AS A NEW ACCENT<br>FOR THE KITCHEN',image:images.kora,mobile:'https://arclinea.com/dw/image/v2/BFXX_PRD/on/demandware.static/-/Library-Sites-Arclinea-contentlib/default/dw3e07267a/HOMEPAGE/Arclinea%20kitchen%20Kora%20luxury%20interior%20with%20marble%20island%20and%20panoramic%20windows%202_M.jpg?bgcolor=FFFFFF&sw=1080'},
  {name:'ITALIA',title:'ITALIA, A STUDY<br>IN ARCHITECTURAL<br>PRECISION',image:images.italia},
  {name:'LIGNUM ET LAPIS',title:'LIGNUM ET LAPIS<br>WOOD, STONE<br>AND BALANCE',image:images.wood}
];
const hero = document.querySelector('.hero');
const heroBackground = document.querySelector('.hero-background');
const heroHeading = hero.querySelector('h1');
const heroCounter = document.getElementById('heroCounter');
const heroIndicators = [...document.querySelectorAll('[data-hero-slide]')];
let heroIndex = 0;
function showHeroSlide(nextIndex) {
  heroIndex = (nextIndex + heroSlides.length) % heroSlides.length;
  const slide = heroSlides[heroIndex];
  const source = window.innerWidth <= 600 && slide.mobile ? slide.mobile : slide.image;
  heroBackground.style.backgroundImage = `url("${source}")`;
  heroBackground.classList.remove('is-changing');
  void heroBackground.offsetWidth;
  heroBackground.classList.add('is-changing');
  heroHeading.innerHTML = slide.title;
  heroCounter.textContent = `${String(heroIndex + 1).padStart(2, '0')} / ${String(heroSlides.length).padStart(2, '0')}`;
  heroIndicators.forEach((button, position) => button.setAttribute('aria-pressed', String(position === heroIndex)));
}
document.getElementById('heroPrevious').addEventListener('click', () => showHeroSlide(heroIndex - 1));
document.getElementById('heroNext').addEventListener('click', () => showHeroSlide(heroIndex + 1));
heroIndicators.forEach(button => button.addEventListener('click', () => showHeroSlide(Number(button.dataset.heroSlide))));
hero.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') { event.preventDefault(); showHeroSlide(heroIndex + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showHeroSlide(heroIndex - 1); }
});

const menu = document.getElementById('menuPanel');
const search = document.getElementById('searchPanel');
const menuToggle = document.getElementById('menuToggle');
const searchToggle = document.getElementById('searchToggle');
let lastTrigger = null;
function setOpen(element, open) {
  element.classList.toggle('open', open);
  element.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = menu.classList.contains('open') || search.classList.contains('open') ? 'hidden' : '';
  if (!open && !menu.classList.contains('open') && !search.classList.contains('open')) lastTrigger?.focus();
}
menuToggle.addEventListener('click', () => {
  lastTrigger = menuToggle;
  setOpen(search, false);
  setOpen(menu, true);
  menuToggle.setAttribute('aria-expanded', 'true');
  menu.querySelector('a').focus();
});
document.getElementById('menuClose').addEventListener('click', () => {
  setOpen(menu, false);
  menuToggle.setAttribute('aria-expanded', 'false');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  setOpen(menu, false);
  menuToggle.setAttribute('aria-expanded', 'false');
}));
searchToggle.addEventListener('click', () => {
  lastTrigger = searchToggle;
  setOpen(menu, false);
  menuToggle.setAttribute('aria-expanded', 'false');
  setOpen(search, true);
  document.getElementById('siteSearch').focus();
});
document.getElementById('searchClose').addEventListener('click', () => setOpen(search, false));
document.addEventListener('keydown', event => {
  const openPanel = menu.classList.contains('open') ? menu : search.classList.contains('open') ? search : null;
  if (event.key === 'Escape' && openPanel) {
    setOpen(openPanel, false);
    menuToggle.setAttribute('aria-expanded', 'false');
    return;
  }
  if (event.key !== 'Tab' || !openPanel) return;
  const focusable = [...openPanel.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled)')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

const header = document.getElementById('siteHeader');
function scrollHeader() { header.classList.toggle('scrolled', window.scrollY > 70); }
window.addEventListener('scroll', scrollHeader, {passive:true});
scrollHeader();
const navigationLinks = [...menu.querySelectorAll('a[href^="#"]')];
const sections = navigationLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navigationLinks.forEach(link => {
        if (link.getAttribute('href') === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, {rootMargin:'-25% 0px -65% 0px'});
  sections.forEach(section => sectionObserver.observe(section));
}

document.getElementById('siteSearch').addEventListener('input', event => {
  const query = event.target.value.toLowerCase().trim();
  const results = document.getElementById('searchResults');
  if (!query) { results.innerHTML = ''; return; }
  const matchedItems = items.filter(item => item.name.toLowerCase().includes(query));
  const matchedCategories = categories.filter(category => category.toLowerCase().includes(query));
  const links = [
    ...matchedItems.map(item => `<a href="#collection">${item.name} <span>COLLECTION ↗</span></a>`),
    ...matchedCategories.map(category => `<a href="#elements">${category} <span>ELEMENT ↗</span></a>`)
  ];
  results.innerHTML = links.length ? links.join('') : '<p>No matching collections or elements found.</p>';
  results.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(search, false)));
});
document.getElementById('newsletterForm').addEventListener('submit', event => {
  event.preventDefault();
  document.getElementById('formMessage').textContent = 'Demo only. No subscription was sent.';
});
document.getElementById('languageButton').addEventListener('click', () => alert('This demo currently supports English only.'));


// Smooth, accessible scrolling effects. No libraries required.
(() => {
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const progress=document.getElementById('scrollProgress');
  const targets=document.querySelectorAll('.intro-grid, .section-header, .collection-card, .statement-content, .elements-intro, .element-card, .showroom-copy, .journal-grid article, .newsletter h2, .newsletter form, .footer-main');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.documentElement.classList.add('js-scroll');
    targets.forEach((el,i)=>{
      el.classList.add('scroll-reveal');
      el.style.setProperty('--reveal-delay',`${(i%4)*85}ms`);
    });
    document.querySelectorAll('.element-card, .journal-grid article').forEach(el=>el.classList.add('image-reveal'));
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}
      });
    },{threshold:0.12,rootMargin:'0px 0px -35px 0px'});
    targets.forEach(el=>observer.observe(el));
  }
  const hero=document.querySelector('.hero');
  const heroImage=document.querySelector('.hero-background');
  const statement=document.querySelector('.statement');
  const statementImage=document.querySelector('.statement-image');
  let queued=false;
  function paint(){
    const max=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform=`scaleX(${max>0?Math.min(1,scrollY/max):0})`;
    if(!reducedMotion.matches){
      if(hero.getBoundingClientRect().bottom>0){
        const amount=Math.min(scrollY,hero.offsetHeight);
        heroImage.style.transform=`translate3d(0,${amount*.23}px,0) scale(1.07)`;
      }
      const r=statement.getBoundingClientRect();
      if(r.bottom>0&&r.top<innerHeight){
        const offset=(innerHeight/2-(r.top+r.height/2))*.13;
        statementImage.style.transform=`translate3d(0,${offset}px,0) scale(1.12)`;
      }
    }else{heroImage.style.transform='';statementImage.style.transform=''}
    queued=false;
  }
  function requestPaint(){if(!queued){queued=true;requestAnimationFrame(paint)}}
  window.addEventListener('scroll',requestPaint,{passive:true});
  window.addEventListener('resize',requestPaint,{passive:true});
  reducedMotion.addEventListener?.('change',requestPaint);
  requestPaint();
})();
