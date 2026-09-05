let content = { courses: [], testimonials: [] };
const byId = (id) => document.querySelector(`#${id}`);
const escape = (value = '') => String(value).replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
const field = (label, key, value, wide = false) => `<label class="${wide ? 'wide' : ''}">${label}<input data-key="${key}" value="${escape(value)}"></label>`;
const render = () => {
  byId('courses').innerHTML = content.courses.map((course, index) => `<article data-index="${index}" data-type="courses"><div class="grid">${field('Course title', 'title', course.title, true)}${field('Duration', 'duration', course.duration)}${field('Current price', 'price', course.price)}${field('Previous price', 'oldPrice', course.oldPrice)}${field('Price note', 'note', course.note)}<label>Featured course<input data-key="featured" type="checkbox" ${course.featured ? 'checked' : ''}></label></div><button class="remove" type="button">Remove course</button></article>`).join('');
  byId('courses').querySelectorAll('article').forEach((article, index) => {
    const course = content.courses[index];
    const visibility = document.createElement('label');
    visibility.innerHTML = `Show on website<input data-key="visible" type="checkbox" ${course.visible !== false ? 'checked' : ''}>`;
    article.querySelector('.grid').append(visibility);
  });
  byId('testimonials').innerHTML = content.testimonials.map((item, index) => `<article data-index="${index}" data-type="testimonials"><div class="grid"><label class="wide">Testimonial<textarea data-key="quote">${escape(item.quote)}</textarea></label>${field('Name', 'name', item.name)}${field('Role', 'role', item.role)}<label>Show on website<input data-key="visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}></label></div><button class="remove" type="button">Remove testimonial</button></article>`).join('');
  byId('testimonials').querySelectorAll('article').forEach((article, index) => {
    const item = content.testimonials[index];
    const proof = document.createElement('label');
    proof.className = 'wide';
    proof.innerHTML = `Proof image / offer letter (PNG, JPG or WebP, max 5 MB)<input data-key="proofUpload" type="file" accept="image/png,image/jpeg,image/webp">${item.proofImage ? `<a class="proof-link" href="/${escape(item.proofImage)}" target="_blank" rel="noopener">View uploaded proof</a>` : ''}`;
    article.querySelector('.grid').append(proof);
  });
};
document.addEventListener('input', (event) => { const article = event.target.closest('article'); if (!article || !event.target.dataset.key) return; const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value; content[article.dataset.type][article.dataset.index][event.target.dataset.key] = value; });
document.addEventListener('change', (event) => {
  const article = event.target.closest('article');
  const file = event.target.files?.[0];
  if (!article || event.target.dataset.key !== 'proofUpload' || !file) return;
  if (file.size > 5 * 1024 * 1024) { byId('status').textContent = 'Please choose an image smaller than 5 MB.'; event.target.value = ''; return; }
  const reader = new FileReader();
  reader.onload = () => { content.testimonials[article.dataset.index].proofImageData = reader.result; byId('status').textContent = 'Proof image ready to save.'; };
  reader.readAsDataURL(file);
});
document.addEventListener('click', (event) => { const article = event.target.closest('article'); if (event.target.classList.contains('remove') && article) { content[article.dataset.type].splice(article.dataset.index, 1); render(); } });
byId('add-course').onclick = () => { content.courses.push({ title: 'New course', duration: '', oldPrice: '', price: '', note: '', featured: false, visible: true }); render(); };
byId('add-testimonial').onclick = () => { content.testimonials.push({ quote: '', name: '', role: '', visible: true }); render(); };
byId('content-form').onsubmit = async (event) => { event.preventDefault(); const status = byId('status'); status.textContent = 'Saving…'; const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) }); status.textContent = response.ok ? 'Saved. Your website is updated.' : 'Unable to save changes.'; };
fetch('/api/content').then((response) => response.json()).then((data) => { content = data; render(); }).catch(() => { byId('status').textContent = 'Unable to load content.'; });
