(() => {
  const gallery = document.querySelector('#offer-letter-gallery');
  if (!gallery) return;
  const count = Number(gallery.dataset.offerCount || 0);
  const format = (number) => String(number).padStart(3, '0');
  gallery.innerHTML = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const source = `assets/offer-letters/offer-letter-${format(number)}.jpeg`;
    return `<a href="${source}" target="_blank" rel="noopener" aria-label="Open offer letter ${number}"><img src="${source}" alt="RV Consulting learner offer letter proof ${number}" loading="lazy"><span>View full letter</span></a>`;
  }).join('');
})();
