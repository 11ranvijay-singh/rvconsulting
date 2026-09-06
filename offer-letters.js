(() => {
  const gallery = document.querySelector('#offer-letter-gallery');
  if (!gallery) return;
  const staticCount = Number(gallery.dataset.offerCount || 0);
  const format = (number) => String(number).padStart(3, '0');
  const staticOfferLetters = Array.from({ length: staticCount }, (_, index) => `assets/offer-letters/offer-letter-${format(index + 1)}.jpeg`);
  const render = (managedOfferLetters = []) => {
    const offers = [...managedOfferLetters.filter((item) => item.visible !== false && item.image).map((item) => item.image), ...staticOfferLetters];
    gallery.innerHTML = offers.map((source, index) => `<a href="${source}" target="_blank" rel="noopener" aria-label="Open offer letter ${index + 1}"><img src="${source}" alt="RV Consulting learner offer letter proof ${index + 1}" loading="lazy"><span>View full letter</span></a>`).join('');
  };
  render();
  fetch('/api/content').then((response) => response.ok ? response.json() : null).then((content) => { if (content) render(content.offerLetters || []); }).catch(() => {});
})();
