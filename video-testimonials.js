(() => {
  const gallery = document.querySelector('#video-testimonial-gallery');
  const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
  const scrollToSelected = () => { const selected = window.location.hash && document.querySelector(window.location.hash); if (selected) selected.scrollIntoView({ block: 'center' }); };
  const render = (items) => { if (gallery && items.length) { gallery.innerHTML = items.map((item, index) => `<article id="video-testimony-${index + 1}"><video controls preload="metadata" playsinline poster="assets/video-testimonials/candidate-video-testimony-thumbnail.png" src="${escape(item.video)}"></video><h2>Video testimony ${String(index + 1).padStart(2, '0')}</h2></article>`).join(''); scrollToSelected(); } };
  fetch('/api/content').then((response) => response.ok ? response.json() : null).then((content) => render((content?.videoTestimonies || []).filter((item) => item.visible !== false && item.video))).catch(() => {});
  scrollToSelected();
})();
