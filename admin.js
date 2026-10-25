let content = { courses: [], testimonials: [], faqs: [], offerLetters: [], videoTestimonies: [], studyMaterials: [], demoClass: {} };
let analyticsData = null;
let generatedCertificate = null;
const byId = (id) => document.querySelector(`#${id}`);
const escape = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
const field = (label, key, value, wide = false) => `<label class="${wide ? 'wide' : ''}">${label}<input data-key="${key}" value="${escape(value)}"></label>`;
const textareaField = (label, key, value, wide = true) => `<label class="${wide ? 'wide' : ''}">${label}<textarea data-key="${key}">${escape(value)}</textarea></label>`;
const status = (message, isError = false) => { const target = byId('status'); target.textContent = message; target.classList.toggle('error', isError); target.classList.toggle('status-visible', Boolean(message)); };
const renderAnalytics = () => {
  if (!analyticsData) return;
  const period = Number(byId('analytics-period').value);
  const visibleDays = analyticsData.trend.slice(-period).reverse();
  const total = visibleDays.reduce((sum, item) => sum + item.visitors, 0);
  const periodLabel = period === 1 ? 'today' : `in the last ${period} days`;
  byId('analytics').innerHTML = `<div class="analytics-cards"><div class="analytics-card"><span>People who visited ${periodLabel}</span><strong>${total}</strong></div><div class="analytics-card"><span>People who visited today</span><strong>${analyticsData.todayVisitors}</strong></div></div><h3>Daily visits</h3><table class="analytics-table"><thead><tr><th>Date</th><th>People who visited</th></tr></thead><tbody>${visibleDays.map((item) => `<tr><td>${item.date}</td><td>${item.visitors}</td></tr>`).join('')}</tbody></table><p class="analytics-note">Each person is counted once per day. This number begins after the new feature was deployed.</p>`;
};
const loadAnalytics = async () => { const target = byId('analytics'); target.textContent = 'Loading visitor statistics…'; try { const response = await fetch('/api/analytics'); if (!response.ok) throw new Error(); analyticsData = await response.json(); renderAnalytics(); } catch { target.textContent = 'Unable to load visitor statistics.'; } };

const render = () => {
  byId('courses').innerHTML = content.courses.map((course, index) => `<article data-index="${index}" data-type="courses"><div class="grid">${field('Course title', 'title', course.title, true)}${field('Duration', 'duration', course.duration)}${field('Current price', 'price', course.price)}${field('Previous price', 'oldPrice', course.oldPrice)}${field('Price note', 'note', course.note)}<label class="toggle-label">Featured course<input data-key="featured" type="checkbox" ${course.featured ? 'checked' : ''}></label><label class="toggle-label">Show on website<input data-key="visible" type="checkbox" ${course.visible !== false ? 'checked' : ''}></label></div><button class="remove" type="button">Remove course</button></article>`).join('');
  byId('faqs').innerHTML = content.faqs.map((item, index) => `<article data-index="${index}" data-type="faqs"><div class="grid">${field('Question', 'question', item.question, true)}${textareaField('Answer', 'answer', item.answer)}<label class="toggle-label">Show on website<input data-key="visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}></label></div><button class="remove" type="button">Remove FAQ</button></article>`).join('');
  byId('testimonials').innerHTML = content.testimonials.map((item, index) => `<article data-index="${index}" data-type="testimonials"><div class="grid">${textareaField('Testimonial', 'quote', item.quote)}${field('Name', 'name', item.name)}${field('Role', 'role', item.role)}<label class="toggle-label">Show on website<input data-key="visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}></label><label class="wide">Proof image / offer letter (PNG, JPG or WebP, max 5 MB)<input data-key="proofUpload" type="file" accept="image/png,image/jpeg,image/webp">${item.proofImage ? `<a class="proof-link" href="/${escape(item.proofImage)}" target="_blank" rel="noopener">View uploaded proof</a>` : ''}</label></div><button class="remove" type="button">Remove testimonial</button></article>`).join('');
  byId('study-materials').innerHTML = content.studyMaterials.map((item, index) => `<article data-index="${index}" data-type="studyMaterials"><div class="grid">${field('Study material title', 'title', item.title, true)}${field('Institute / brand', 'institution', item.institution)}${field('Edition', 'edition', item.edition)}${field('Qualification / subtitle', 'subtitle', item.subtitle, true)}${textareaField('Description', 'description', item.description)}${field('Original price', 'oldPrice', item.oldPrice)}${field('Offer price', 'price', item.price)}${field('Price note', 'note', item.note)}${textareaField('WhatsApp request message', 'whatsappMessage', item.whatsappMessage)}<label class="toggle-label">Show on website<input data-key="visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}></label></div><button class="remove" type="button">Remove study material</button></article>`).join('');
  const demo = content.demoClass || {};
  byId('demo-class').innerHTML = `<article data-type="demoClass"><div class="grid">${field('Demo-class title', 'title', demo.title, true)}${textareaField('Description', 'description', demo.description)}${textareaField('Contact message', 'contactMessage', demo.contactMessage)}${field('WhatsApp or meeting link', 'meetingLink', demo.meetingLink, true)}${field('Button label', 'buttonLabel', demo.buttonLabel)}<label class="toggle-label">Show on website<input data-key="visible" type="checkbox" ${demo.visible !== false ? 'checked' : ''}></label></div></article>`;
  byId('offer-letters').innerHTML = content.offerLetters.map((item, index) => `<article data-index="${index}" data-type="offerLetters"><div class="grid"><label class="toggle-label">Show on website<input data-key="visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}></label><label class="wide">Offer-letter image (PNG, JPG or WebP, max 5 MB)<input data-key="offerLetterUpload" type="file" accept="image/png,image/jpeg,image/webp">${item.image ? `<a class="proof-link" href="/${escape(item.image)}" target="_blank" rel="noopener">View uploaded offer letter</a>` : ''}</label></div><button class="remove" type="button">Remove offer letter</button></article>`).join('') || '<div class="empty-state">No offer letters yet. Use “Upload offer-letter image(s)” to add one or many at once.</div>';
  byId('video-testimonies').innerHTML = content.videoTestimonies.map((item, index) => `<article data-index="${index}" data-type="videoTestimonies"><div class="grid"><label class="toggle-label">Show on website<input data-key="visible" type="checkbox" ${item.visible !== false ? 'checked' : ''}></label><label class="wide">Video file${item.video ? `<a class="proof-link" href="/${escape(item.video)}" target="_blank" rel="noopener">Preview uploaded video</a>` : ''}</label></div><button class="remove" type="button">Remove video testimony</button></article>`).join('') || '<div class="empty-state">No video testimonies yet. Use “Upload video(s)” to add one or many MP4 files.</div>';
};

const showPanel = (name) => { document.querySelectorAll('.admin-panel').forEach((panel) => { panel.hidden = panel.dataset.panel !== name; }); document.querySelectorAll('.menu-link').forEach((link) => link.classList.toggle('active', link.dataset.panelTarget === name)); if (name === 'analytics') loadAnalytics(); status(''); };
const ensureArrays = () => { content.courses ||= []; content.testimonials ||= []; content.faqs ||= []; content.offerLetters ||= []; content.videoTestimonies ||= []; content.studyMaterials ||= []; content.demoClass ||= {}; };
const saveSection = async (name) => { status(`Saving ${name}...`); try { const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) }); if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.error || 'Unable to save changes.'); } content = await response.json(); ensureArrays(); render(); status(`${name.charAt(0).toUpperCase() + name.slice(1)} saved. Your website is updated.`); } catch (error) { status(error.message || 'Unable to save changes. Please check your connection and try again.', true); } };
const generateCertificate = async () => {
  const name = byId('certificate-name').value.trim();
  const date = byId('certificate-date').value;
  const button = byId('generate-certificate');
  if (!name || !date) return status('Enter the recipient name and certificate date.', true);
  button.disabled = true; button.classList.add('is-loading'); button.textContent = 'Generating PDF certificate';
  status('Generating PDF certificate...');
  try {
    const response = await fetch('/api/certificates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, date }) });
    if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.error || 'Certificate generation failed.'); }
    const filename = `RV_Certificate_${name.replace(/[^a-z0-9]+/gi, '_')}.pdf`;
    generatedCertificate = { blob: await response.blob(), filename };
    byId('certificate-actions').hidden = false;
    status('PDF certificate generated. Choose an action below.');
  } catch (error) { status(error.message || 'Certificate generation failed.', true); }
  finally { button.disabled = false; button.classList.remove('is-loading'); button.textContent = 'Generate PDF certificate'; }
};
const downloadBlob = (blob, filename) => { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
const downloadGeneratedCertificate = () => { if (!generatedCertificate) return status('Generate a certificate first.', true); downloadBlob(generatedCertificate.blob, generatedCertificate.filename); status('Certificate download started.'); };
const shareGeneratedCertificate = async () => {
  if (!generatedCertificate) return status('Generate a certificate first.', true);
  const file = new File([generatedCertificate.blob], generatedCertificate.filename, { type: 'application/pdf' });
  if (!navigator.share || (navigator.canShare && !navigator.canShare({ files: [file] }))) return downloadGeneratedCertificate();
  try { await navigator.share({ title: 'RV Consulting certificate', text: 'Certificate from RV Consulting', files: [file] }); status('Certificate shared.'); } catch (error) { if (error.name !== 'AbortError') status('Unable to share the certificate file. Download it instead.', true); }
};
const shareCertificateOnWhatsApp = () => {
  const message = '🎓 Discover practical AML, KYC, fraud and crypto investigation training with RV Consulting. Explore courses, learner outcomes and career guidance: https://rv-consulting.in/';
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
};
const parseCertificateCsv = (text) => {
  const rows = []; let row = []; let value = ''; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]; const next = text[index + 1];
    if (character === '"' && quoted && next === '"') { value += '"'; index += 1; } else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { row.push(value); value = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && next === '\n') index += 1; row.push(value); if (row.some((cell) => cell.trim())) rows.push(row); row = []; value = ''; }
    else value += character;
  }
  row.push(value); if (row.some((cell) => cell.trim())) rows.push(row);
  if (!rows.length) throw new Error('The CSV file is empty.');
  const headers = rows.shift().map((header) => header.trim().toLowerCase()); const nameColumn = headers.indexOf('name'); const dateColumn = headers.indexOf('date');
  if (nameColumn < 0 || dateColumn < 0) throw new Error('The first CSV row must contain name,date.');
  const entries = rows.map((cells, index) => ({ name: (cells[nameColumn] || '').trim(), date: (cells[dateColumn] || '').trim(), row: index + 2 }));
  const invalid = entries.find((entry) => !entry.name || entry.name.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date));
  if (invalid) throw new Error(`Check CSV row ${invalid.row}: add a name and a date in YYYY-MM-DD format.`);
  return entries;
};
const generateBulkCertificates = async () => {
  const file = byId('certificate-bulk-file').files[0]; const button = byId('generate-bulk-certificates');
  if (!file) return status('Choose a CSV file first.', true);
  try {
    const entries = parseCertificateCsv(await file.text());
    if (!entries.length) throw new Error('Add at least one certificate recipient.');
    if (entries.length > 100) throw new Error('Generate up to 100 certificates at a time.');
    button.disabled = true; button.classList.add('is-loading'); button.textContent = 'Generating ZIP file'; status(`Generating ${entries.length} PDF certificate${entries.length === 1 ? '' : 's'}...`);
    const response = await fetch('/api/certificates/bulk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entries }) });
    if (!response.ok) { const result = await response.json().catch(() => ({})); throw new Error(result.error || 'Certificate generation failed.'); }
    downloadBlob(await response.blob(), 'RV_Certificates.zip'); status(`${entries.length} PDF certificate${entries.length === 1 ? '' : 's'} generated in a ZIP file.`);
  } catch (error) { status(error.message || 'Certificate generation failed.', true); }
  finally { button.disabled = false; button.classList.remove('is-loading'); button.textContent = 'Generate ZIP of PDF certificates'; }
};
const setCertificateMode = (mode) => { const isSingle = mode === 'single'; byId('single-certificate-form').hidden = !isSingle; byId('bulk-certificate-form').hidden = isSingle; document.querySelectorAll('[data-certificate-mode]').forEach((button) => { const active = button.dataset.certificateMode === mode; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); }); status(''); };
const showSelectedCertificateDate = () => {
  const value = byId('certificate-date').value;
  byId('certificate-date-display').textContent = value ? `Selected certificate date: ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`))}` : 'No certificate date selected.';
};
const uploadFiles = async (files, type) => {
  const selected = Array.from(files || []);
  if (!selected.length) return;
  const isVideo = type === 'videoTestimonies';
  const allowed = isVideo ? (file) => file.type === 'video/mp4' || /\.mp4$/i.test(file.name) : (file) => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name);
  const maxBytes = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
  const invalid = selected.find((file) => !allowed(file) || file.size > maxBytes);
  if (invalid) return status(isVideo ? 'Choose MP4 videos up to 100 MB each.' : 'Choose PNG, JPG, or WebP images up to 5 MB each.', true);
  const endpoint = isVideo ? '/api/media/video' : '/api/media/offer-letter';
  const label = isVideo ? 'video testimony' : 'offer letter';
  try {
    for (const [index, file] of selected.entries()) {
      status(`Uploading ${label} ${index + 1} of ${selected.length}...`);
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': file.type || (isVideo ? 'video/mp4' : 'image/jpeg'), 'X-File-Name': file.name }, body: file });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || `Unable to upload ${file.name}.`);
      const pathKey = isVideo ? 'video' : 'image';
      if (!content[type].some((item) => item[pathKey] === result.path)) content[type].unshift({ [pathKey]: result.path, visible: true });
    }
    await saveSection(type);
    status(`${selected.length} ${label}${selected.length === 1 ? '' : 's'} uploaded and published.`);
  } catch (error) { status(error.message || 'Upload failed. Please try again.', true); }
};

document.addEventListener('input', (event) => { const article = event.target.closest('article'); if (!article || !event.target.dataset.key || event.target.type === 'file') return; const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value; if (article.dataset.type === 'demoClass') content.demoClass[event.target.dataset.key] = value; else content[article.dataset.type][article.dataset.index][event.target.dataset.key] = value; });
document.addEventListener('change', (event) => { const article = event.target.closest('article'); const file = event.target.files?.[0]; const key = event.target.dataset.key; if (!article || !file || !['proofUpload', 'offerLetterUpload'].includes(key)) return; const allowedType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || /\.(png|jpe?g|webp)$/i.test(file.name); if (!allowedType) { status('Unsupported image type. Please upload only PNG, JPG, or WebP images.', true); event.target.value = ''; return; } if (file.size > 5 * 1024 * 1024) { status('Image is too large. The maximum allowed size is 5 MB.', true); event.target.value = ''; return; } const reader = new FileReader(); reader.onload = () => { const item = content[article.dataset.type][article.dataset.index]; if (key === 'proofUpload') item.proofImageData = reader.result; else item.imageData = reader.result; status('Image ready. Click the save button for this section.'); }; reader.readAsDataURL(file); });
byId('analytics-period').addEventListener('change', renderAnalytics);
byId('certificate-date').addEventListener('change', showSelectedCertificateDate);
byId('bulk-offer-letter-upload').addEventListener('change', (event) => { uploadFiles(event.target.files, 'offerLetters').finally(() => { event.target.value = ''; }); });
byId('bulk-video-testimony-upload').addEventListener('change', (event) => { uploadFiles(event.target.files, 'videoTestimonies').finally(() => { event.target.value = ''; }); });
document.addEventListener('click', (event) => { const panelLink = event.target.closest('.menu-link'); if (panelLink) return showPanel(panelLink.dataset.panelTarget); const modeButton = event.target.closest('[data-certificate-mode]'); if (modeButton) return setCertificateMode(modeButton.dataset.certificateMode); if (event.target.closest('#refresh-analytics')) return loadAnalytics(); if (event.target.closest('#generate-certificate')) return generateCertificate(); if (event.target.closest('#download-certificate')) return downloadGeneratedCertificate(); if (event.target.closest('#share-certificate-file')) return shareGeneratedCertificate(); if (event.target.closest('#share-certificate-whatsapp')) return shareCertificateOnWhatsApp(); if (event.target.closest('#generate-bulk-certificates')) return generateBulkCertificates(); const saveButton = event.target.closest('[data-save-section]'); if (saveButton) return saveSection(saveButton.dataset.saveSection); const article = event.target.closest('article'); if (event.target.classList.contains('remove') && article) { content[article.dataset.type].splice(article.dataset.index, 1); render(); } });
byId('add-course').onclick = () => { content.courses.push({ title: 'New course', duration: '', oldPrice: '', price: '', note: '', featured: false, visible: true }); render(); };
byId('add-faq').onclick = () => { content.faqs.push({ question: 'New question', answer: '', visible: true }); render(); };
byId('add-testimonial').onclick = () => { content.testimonials.push({ quote: '', name: '', role: '', visible: true }); render(); };
byId('add-study-material').onclick = () => { content.studyMaterials.push({ title: 'New study material', institution: 'RV Consulting Institute', edition: '', subtitle: '', description: '', oldPrice: '', price: '', note: 'Study-material access', whatsappMessage: 'Hi RV Consulting, I want to get access to the study material notes.', visible: true }); render(); };
byId('add-offer-letter')?.addEventListener('click', () => { content.offerLetters.push({ visible: true }); render(); });
byId('content-form').addEventListener('submit', (event) => event.preventDefault());
fetch('/api/content').then((response) => { if (!response.ok) throw new Error(); return response.json(); }).then((data) => { content = { ...content, ...data }; ensureArrays(); render(); }).catch(() => status('Unable to load content.', true));
