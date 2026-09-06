const input = document.querySelector('#course-search');
const button = document.querySelector('#search-button');
const cards = [...document.querySelectorAll('.course-card')];
const empty = document.querySelector('#no-results');
function filterCourses() {
  const term = input.value.trim().toLowerCase();
  let count = 0;
  cards.forEach((card) => {
    const matches = card.dataset.course.includes(term);
    card.hidden = !matches;
    if (matches) count += 1;
  });
  empty.hidden = count !== 0;
}
button.addEventListener('click', filterCourses);
input.addEventListener('input', filterCourses);
input.addEventListener('keydown', (event) => { if (event.key === 'Enter') filterCourses(); });

const marketSearch = document.querySelector('#market-search');
const marketSearchButton = document.querySelector('#market-search-button');
function searchFromMarketbar() {
  input.value = marketSearch.value;
  filterCourses();
  document.querySelector('#programs').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
marketSearchButton?.addEventListener('click', searchFromMarketbar);
marketSearch?.addEventListener('keydown', (event) => { if (event.key === 'Enter') searchFromMarketbar(); });

const enquiryForm = document.querySelector('#enquiry-form');
enquiryForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(enquiryForm);
  const resume = data.get('resume');
  const resumeLine = resume?.name ? '\nResume selected: ' + resume.name + ' (please attach it in this WhatsApp chat)' : '';
  const message = 'Hello RV Consulting,\n\nI would like to enquire about a course.\n\nName: ' + data.get('name') + '\nPhone: ' + data.get('phone') + '\nCourse interest: ' + data.get('course') + '\nConcern: ' + data.get('concern') + resumeLine;
  window.open('https://wa.me/919717766543?text=' + encodeURIComponent(message), '_blank', 'noopener');
});

// Keep video thumbnails in this website package so they are visible even when
// a viewer's network blocks direct YouTube image loading.
const localVideoImages = {
  OAxoADhdqYY: 'assets/video-OAxoADhdqYY.jpg',
  eARQCdwshQE: 'assets/video-eARQCdwshQE.jpg',
  kUd1o8g8BgQ: 'assets/video-kUd1o8g8BgQ.jpg',
  SsCWpPpqNtE: 'assets/video-SsCWpPpqNtE.jpg',
  bb8M6WEOzf8: 'assets/video-bb8M6WEOzf8.jpg'
};
document.querySelectorAll('img[src*="img.youtube.com/vi/"]').forEach((image) => {
  const match = image.src.match(/\/vi\/([^/]+)/);
  if (match && localVideoImages[match[1]]) image.src = localVideoImages[match[1]];
});

// Keep programme pricing evergreen rather than tying it to a dated intake.
document.querySelectorAll('.fee-card .price small').forEach((note, index) => {
  note.textContent = index === 0 ? 'Programme fee' : 'Course fee';
});

const html = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
async function loadManagedContent() {
  try {
    const response = await fetch('/api/content');
    if (!response.ok) return;
    const content = await response.json();
    const courseList = document.querySelector('.fee-grid');
    const visibleCourses = content.courses?.filter((course) => course.visible !== false) || [];
    if (courseList && visibleCourses.length) {
      courseList.innerHTML = visibleCourses.map((course) => `<article class="fee-card ${course.featured ? 'fee-card-featured' : ''}"><p class="fee-label">${course.featured ? 'MOST COMPREHENSIVE' : 'CAREER PROGRAMME'}</p><h3>${html(course.title)}</h3><p class="duration">${html(course.duration)}</p><div class="price"><s>${html(course.oldPrice)}</s><strong>${html(course.price)}</strong><small>${html(course.note)}</small></div><a class="button ${course.featured ? '' : 'button-outline'}" href="#enquiry">Enquire now <span>→</span></a></article>`).join('');
    }
    const visibleTestimonials = content.testimonials?.filter((item) => item.visible !== false) || [];
    const testimonial = document.querySelector('.testimonial');
    if (testimonial && visibleTestimonials.length) {
      testimonial.innerHTML = visibleTestimonials.map((item) => `<article class="managed-testimonial"><div class="quote">“</div><blockquote>${html(item.quote)}</blockquote><div class="student"><div class="student-photo">RV</div><p><b>${html(item.name)}</b><br>${html(item.role)}</p></div></article>`).join('');
      testimonial.querySelectorAll('.managed-testimonial').forEach((card, index) => {
        const proofImage = visibleTestimonials[index].proofImage;
        if (!proofImage) return;
        const image = document.createElement('img');
        image.src = proofImage;
        image.alt = `Offer letter or proof for ${visibleTestimonials[index].name}`;
        image.loading = 'lazy';
        image.style.cssText = 'display:block;max-width:100%;max-height:260px;margin:0 auto 20px;border:1px solid #d6e2f3;border-radius:4px';
        card.prepend(image);
      });
    }
    const offerPreview = document.querySelector('.offer-letter-preview');
    const managedOfferLetters = content.offerLetters?.filter((item) => item.visible !== false && item.image) || [];
    if (offerPreview && managedOfferLetters.length) {
      const staticOfferLetters = Array.from({ length: 94 }, (_, index) => `assets/offer-letters/offer-letter-${String(index + 1).padStart(3, '0')}.jpeg`);
      const allOfferLetters = [...managedOfferLetters.map((item) => item.image), ...staticOfferLetters].slice(0, 6);
      offerPreview.innerHTML = allOfferLetters.map((image, index) => `<a href="${html(image)}" target="_blank" rel="noopener"><img src="${html(image)}" alt="Learner offer letter proof ${index + 1}" loading="lazy"><span>View offer letter</span></a>`).join('');
    }
  } catch (_) { /* The static preview remains usable when the admin API is unavailable. */ }
}
loadManagedContent();

const companyLogoMarks = {
  amex: ['americanexpress', 'American Express'], barclays: ['barclays', 'Barclays'],
  exl: ['exl', 'EXL'], optum: ['optum', 'Optum'], revolut: ['revolut', 'Revolut'],
  genpact: ['genpact', 'Genpact'], accenture: ['accenture', 'Accenture'],
  bt: ['bt', 'BT'], wipro: ['wipro', 'Wipro'], hcl: ['hcl', 'HCLTech'],
};
Object.entries(companyLogoMarks).forEach(([className, [brand, name]]) => {
  const company = document.querySelector(`.company-logo.${className}`);
  if (!company) return;
  company.querySelector('i')?.remove();
  const logo = document.createElement('img');
  logo.src = `https://cdn.simpleicons.org/${brand}`;
  logo.alt = `${name} logo`;
  logo.loading = 'lazy';
  logo.style.cssText = 'width:42px;height:42px;object-fit:contain;flex:0 0 auto';
  logo.onerror = () => logo.remove();
  company.prepend(logo);
});

const heroMomentumCard = document.querySelector('.card-bottom');
if (heroMomentumCard) {
  heroMomentumCard.innerHTML = '<span class="round-progress">LAB</span><div><b>Real case labs</b><small>Follow the money trail</small></div>';
}
