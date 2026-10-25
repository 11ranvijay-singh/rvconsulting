(() => {
  const selected = window.location.hash && document.querySelector(window.location.hash);
  if (selected) selected.scrollIntoView({ block: 'center' });
})();
