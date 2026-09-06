(() => {
  const gallery = document.querySelector('#testimonial-gallery');
  if (!gallery) return;
  const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const render = (items) => {
    if (!items.length) { gallery.innerHTML = '<p>No learner stories are available yet.</p>'; return; }
    gallery.innerHTML = items.map((item) => `<article class="managed-testimonial">${item.proofImage ? `<a href="${escape(item.proofImage)}" target="_blank" rel="noopener"><img class="testimonial-proof" src="${escape(item.proofImage)}" alt="Offer letter or proof for ${escape(item.name)}" loading="lazy"></a>` : ''}<div class="quote">“</div><blockquote>${escape(item.quote)}</blockquote><div class="student"><div class="student-photo">RV</div><p><b>${escape(item.name)}</b><br>${escape(item.role)}</p></div></article>`).join('');
  };
  fetch('/api/content').then((response) => response.ok ? response.json() : Promise.reject()).then((content) => render((content.testimonials || []).filter((item) => item.visible !== false))).catch(() => { gallery.innerHTML = '<p>Unable to load learner stories right now.</p>'; });
})();
