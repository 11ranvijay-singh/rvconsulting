(() => {
  document.querySelectorAll('.video-testimonial-card video').forEach((video) => {
    const showPreview = () => { video.currentTime = Math.min(0.1, video.duration || 0); };
    video.addEventListener('loadedmetadata', showPreview, { once: true });
    if (video.readyState >= 1) showPreview();
  });
  const selected = window.location.hash && document.querySelector(window.location.hash);
  if (selected) selected.scrollIntoView({ block: 'center' });
})();
