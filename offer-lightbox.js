(() => {
  const selector = '.offer-letter-preview a, .offer-letter-gallery a';
  let activeIndex = 0;
  let activeItems = [];
  let lastTrigger = null;
  const lightbox = document.createElement('div');
  lightbox.className = 'offer-lightbox';
  lightbox.hidden = true;
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Offer letter viewer');
  lightbox.innerHTML = '<div class="offer-lightbox-dialog"><div class="offer-lightbox-top"><div>Offer letter <span id="offer-lightbox-count"></span></div><button class="offer-lightbox-close" type="button" aria-label="Close offer letter viewer">×</button></div><div class="offer-lightbox-image-wrap"><img class="offer-lightbox-image" alt="Offer letter proof"></div><div class="offer-lightbox-actions"><button class="offer-lightbox-nav" type="button" data-offer-direction="previous">← Back</button><button class="offer-lightbox-nav" type="button" data-offer-direction="next">Next →</button></div></div>';
  document.body.append(lightbox);
  const image = lightbox.querySelector('.offer-lightbox-image');
  const counter = lightbox.querySelector('#offer-lightbox-count');
  const previous = lightbox.querySelector('[data-offer-direction="previous"]');
  const next = lightbox.querySelector('[data-offer-direction="next"]');
  const close = lightbox.querySelector('.offer-lightbox-close');

  const render = () => {
    const item = activeItems[activeIndex];
    if (!item) return;
    image.src = item.source;
    image.alt = item.alt;
    counter.textContent = `${activeIndex + 1} of ${activeItems.length}`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === activeItems.length - 1;
  };
  const open = (items, index, trigger) => {
    activeItems = items;
    activeIndex = index;
    lastTrigger = trigger;
    render();
    lightbox.hidden = false;
    close.focus();
  };
  const hide = () => { lightbox.hidden = true; image.removeAttribute('src'); lastTrigger?.focus(); };
  document.addEventListener('click', (event) => {
    const link = event.target.closest(selector);
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    const gallery = link.closest('.offer-letter-preview, .offer-letter-gallery');
    const links = gallery ? Array.from(gallery.querySelectorAll('a')) : [];
    const items = links.map((entry, index) => ({ source: entry.href, alt: entry.querySelector('img')?.alt || `Offer letter proof ${index + 1}` }));
    open(items, links.indexOf(link), link);
  });
  previous.addEventListener('click', () => { if (activeIndex > 0) { activeIndex -= 1; render(); } });
  next.addEventListener('click', () => { if (activeIndex < activeItems.length - 1) { activeIndex += 1; render(); } });
  close.addEventListener('click', hide);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) hide(); });
  document.addEventListener('keydown', (event) => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') hide();
    if (event.key === 'ArrowLeft' && activeIndex > 0) { activeIndex -= 1; render(); }
    if (event.key === 'ArrowRight' && activeIndex < activeItems.length - 1) { activeIndex += 1; render(); }
  });
})();
