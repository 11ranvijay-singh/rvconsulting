const input = document.querySelector('#course-search');
const button = document.querySelector('#search-button');
const cards = [...document.querySelectorAll('.course-card')];
const empty = document.querySelector('#no-results');
const pageLoader = document.querySelector('#page-loader');
const dismissLoader = () => pageLoader?.classList.add('is-hidden');
window.addEventListener('load', () => window.setTimeout(dismissLoader, 180));
window.setTimeout(dismissLoader, 3500);
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
const courseModalContent = {
  aml: { description: 'Build a practical foundation for reviewing customer risk and identifying financial-crime red flags.', points: ['Customer due diligence and enhanced due diligence', 'Sanctions, PEP and adverse-media screening', 'Risk profiling and transaction-monitoring basics'] },
  fraud: { description: 'Learn a structured approach to detecting, documenting and escalating fraud-related concerns.', points: ['Payment, identity and account-takeover risk signals', 'Evidence review and case investigation workflow', 'Clear investigation notes and escalation summaries'] },
  crypto: { description: 'Understand how to assess wallet activity and follow transaction trails in crypto-related reviews.', points: ['Blockchain, wallet and transaction fundamentals', 'Crypto AML risk indicators and tracing concepts', 'Practical review approach for suspicious activity'] }
};
const openCourseModal = (title, detail) => {
  let modal = document.querySelector('#course-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'course-modal';
    modal.className = 'course-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.append(modal);
  }
  const message = encodeURIComponent(`Hi RV Consulting, I would like one-to-one guidance for ${title}. Please guide me.`);
  modal.innerHTML = `<div class="course-modal-dialog"><button class="course-modal-close" type="button" aria-label="Close course details">×</button><span class="course-modal-kicker">MODULE OVERVIEW</span><h2>${html(title)}</h2><p class="course-modal-description">${html(detail.description)}</p><ul class="course-modal-points">${detail.points.map((point) => `<li>${html(point)}</li>`).join('')}</ul><a class="button" href="https://wa.me/919717766543?text=${message}" target="_blank" rel="noopener">Contact us for one-to-one guidance <span>→</span></a></div>`;
  modal.hidden = false;
  modal.querySelector('.course-modal-close').focus();
};
const openApproachModal = () => {
  let modal = document.querySelector('#course-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'course-modal';
    modal.className = 'course-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    document.body.append(modal);
  }
  const message = encodeURIComponent('Hi RV Consulting, I would like to understand your training approach better. Please guide me one-to-one.');
  modal.innerHTML = `<div class="course-modal-dialog"><button class="course-modal-close" type="button" aria-label="Close our approach details">×</button><span class="course-modal-kicker">OUR APPROACH</span><h2>Learn by doing.</h2><p class="course-modal-description">Our training is designed around the way financial-crime work is done in practice: understand the risk, review the evidence and document a clear conclusion.</p><ul class="course-modal-points"><li>Practical AML, KYC, fraud and crypto scenarios</li><li>Step-by-step guidance for reviewing risk signals</li><li>Clear notes, escalation and report-writing practice</li><li>One-to-one support for course and career questions</li></ul><div class="course-modal-actions"><a class="button" href="https://wa.me/919717766543?text=${message}" target="_blank" rel="noopener">WhatsApp us <span>→</span></a><a class="button" href="tel:+919717766543">Call us <span>→</span></a></div></div>`;
  modal.hidden = false;
  modal.querySelector('.course-modal-close').focus();
};
document.addEventListener('click', (event) => {
  const approachLink = event.target.closest('.why-copy .button-light');
  if (approachLink) {
    event.preventDefault();
    openApproachModal();
    return;
  }
  const exploreLink = event.target.closest('.course-card .course-info a');
  if (exploreLink) {
    event.preventDefault();
    const card = exploreLink.closest('.course-card');
    const topic = card?.dataset.course || '';
    const detail = topic.includes('crypto') ? courseModalContent.crypto : topic.includes('fraud') ? courseModalContent.fraud : courseModalContent.aml;
    openCourseModal(card?.querySelector('h3')?.textContent.trim() || 'Course module', detail);
  }
  const modal = document.querySelector('#course-modal');
  if (modal && (event.target === modal || event.target.closest('.course-modal-close'))) modal.hidden = true;
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { const modal = document.querySelector('#course-modal'); if (modal) modal.hidden = true; } });

function renderManagedFaqs(faqs) {
  const faqSection = document.querySelector('#faq');
  const faqList = faqSection?.querySelector('.faq-list');
  const visibleFaqs = Array.isArray(faqs) ? faqs.filter((item) => item.visible !== false && item.question && item.answer) : [];
  if (!faqSection || !faqList || !visibleFaqs.length) return;
  faqSection.querySelector('.faq-view-all')?.remove();
  document.querySelector('#faq-modal')?.remove();
  faqList.innerHTML = visibleFaqs.slice(0, 4).map((item) => `<details><summary>${html(item.question)}</summary><p>${html(item.answer)}</p></details>`).join('');
  if (visibleFaqs.length <= 4) return;
  const action = document.createElement('div');
  action.className = 'faq-view-all';
  action.innerHTML = '<button class="button" type="button">View all FAQs <span>&rarr;</span></button>';
  faqList.insertAdjacentElement('afterend', action);
  const modal = document.createElement('div');
  modal.className = 'faq-modal';
  modal.id = 'faq-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'faq-modal-title');
  modal.innerHTML = `<div class="faq-modal-card"><button class="faq-modal-close" type="button" aria-label="Close all FAQs">&times;</button><h2 id="faq-modal-title">More answers</h2><p>Everything you may want to know before starting your learning journey.</p><div class="faq-list">${visibleFaqs.slice(4).map((item) => `<details><summary>${html(item.question)}</summary><p>${html(item.answer)}</p></details>`).join('')}</div></div>`;
  document.body.append(modal);
  const hideFaqModal = () => { modal.hidden = true; action.querySelector('button')?.focus(); };
  action.querySelector('button')?.addEventListener('click', () => { modal.hidden = false; modal.querySelector('.faq-modal-close')?.focus(); });
  modal.querySelector('.faq-modal-close')?.addEventListener('click', hideFaqModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) hideFaqModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) hideFaqModal(); });
}

async function loadManagedContent() {
  try {
    const response = await fetch('/api/content');
    if (!response.ok) return;
    const content = await response.json();
    window.setTimeout(() => renderManagedFaqs(content.faqs), 0);
    const courseList = document.querySelector('.fee-grid');
    const visibleCourses = content.courses?.filter((course) => course.visible !== false) || [];
    if (courseList && visibleCourses.length) {
      courseList.innerHTML = visibleCourses.map((course) => `<article class="fee-card ${course.featured ? 'fee-card-featured' : ''}"><p class="fee-label">${course.featured ? 'MOST COMPREHENSIVE' : 'CAREER PROGRAMME'}</p><h3>${html(course.title)}</h3><p class="duration">${html(course.duration)}</p><div class="price"><s>${html(course.oldPrice)}</s><strong>${html(course.price)}</strong><small>${html(course.note)}</small></div><a class="button ${course.featured ? '' : 'button-outline'}" href="#enquiry">Enquire now <span>→</span></a></article>`).join('');
    }
    const studyMaterial = content.studyMaterials?.find((item) => item.visible !== false);
    const studySection = document.querySelector('.study-material-section');
    if (studySection && studyMaterial) {
      const requestMessage = encodeURIComponent(studyMaterial.whatsappMessage || `Hi RV Consulting, I want to get access to the ${studyMaterial.title} notes.`);
      studySection.innerHTML = `<div class="study-material-book" aria-hidden="true"><span>RV</span><small>${html(studyMaterial.institution || 'RV Consulting Institute')}</small><b>${html(studyMaterial.title)}</b><em>${html(studyMaterial.edition)}</em><i>${html(studyMaterial.subtitle)}</i></div><div class="study-material-copy"><p class="eyebrow"><i></i> STUDY MATERIAL</p><h2>${html(studyMaterial.title)}</h2><p>${html(studyMaterial.description)}</p><ul><li><span>01</span>${html(studyMaterial.edition)}</li><li><span>02</span>${html(studyMaterial.subtitle)}</li><li><span>03</span>Professional AML/KYC study reference</li></ul><div class="study-material-price"><span><s>${html(studyMaterial.oldPrice)}</s> Original price</span><strong>${html(studyMaterial.price)}</strong><small>${html(studyMaterial.note || 'Study-material access')}</small></div><a class="button" href="https://wa.me/919717766543?text=${requestMessage}" target="_blank" rel="noopener">Request notes on WhatsApp <span>→</span></a><p class="study-material-note">Send us a WhatsApp message and our team will guide you on getting access.</p></div>`;
    }
    const demoSection = document.querySelector('.demo-class-section');
    const demoClass = content.demoClass;
    if (demoSection && demoClass) {
      demoSection.hidden = demoClass.visible === false;
      const rawMeetingLink = String(demoClass.meetingLink || '');
      const meetingLink = /^https?:\/\//i.test(rawMeetingLink) ? rawMeetingLink : 'https://wa.me/919717766543';
      if (!demoSection.hidden) demoSection.innerHTML = `<div class="demo-calendar"><span>LIVE</span><b>DEMO</b><small>CLASS</small></div><div class="demo-class-copy"><p class="eyebrow"><i></i> FREE LIVE SESSION</p><h2>${html(demoClass.title || 'Live demo class')}</h2><p>${html(demoClass.description || '')}</p><p class="demo-contact-note">${html(demoClass.contactMessage || 'Contact us and we will give you full details on how to connect to your next demo class.')}</p></div><a class="button demo-class-button" href="${html(meetingLink)}" target="_blank" rel="noopener">${html(demoClass.buttonLabel || 'Contact us for demo details')} <span>→</span></a>`;
    }
    const visibleTestimonials = (content.testimonials?.filter((item) => item.visible !== false) || []).slice(0, 3);
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
    const storiesSection = document.querySelector('#stories');
    if (storiesSection && !storiesSection.querySelector('.testimonial-action')) {
      const action = document.createElement('div');
      action.className = 'testimonial-action';
      action.innerHTML = '<a class="button" href="testimonials.html">View all learner stories <span>→</span></a>';
      storiesSection.append(action);
    }
    const offerPreview = document.querySelector('.offer-letter-preview');
    const managedOfferLetters = content.offerLetters?.filter((item) => item.visible !== false && item.image) || [];
    if (offerPreview && managedOfferLetters.length) {
      const staticOfferLetters = Array.from({ length: 91 }, (_, index) => `assets/offer-letters/offer-letter-${String(index + 1).padStart(3, '0')}.jpeg`);
      const allOfferLetters = [...managedOfferLetters.map((item) => item.image), ...staticOfferLetters].slice(0, 6);
      offerPreview.innerHTML = allOfferLetters.map((image, index) => `<a href="${html(image)}" target="_blank" rel="noopener"><img src="${html(image)}" alt="Learner offer letter proof ${index + 1}" loading="lazy"><span>View offer letter</span></a>`).join('');
    }
  } catch (_) { /* The static preview remains usable when the admin API is unavailable. */ }
}
loadManagedContent().finally(dismissLoader);

const backToTop = document.querySelector('#back-to-top');
const toggleBackToTop = () => backToTop?.classList.toggle('is-visible', window.scrollY > 420);
window.addEventListener('scroll', toggleBackToTop, { passive: true });
toggleBackToTop();
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

const heroMomentumCard = document.querySelector('.card-bottom');
if (heroMomentumCard) {
  heroMomentumCard.innerHTML = '<span class="round-progress">LAB</span><div><b>Real case labs</b><small>Follow the money trail</small></div>';
}

const welcomePopupKey = 'rv-welcome-popup-dismissed';
const showWelcomePopup = () => {
  if (sessionStorage.getItem(welcomePopupKey)) return;
  const popup = document.createElement('div');
  popup.className = 'welcome-popup';
  popup.id = 'welcome-popup';
  popup.setAttribute('role', 'dialog');
  popup.setAttribute('aria-modal', 'true');
  popup.setAttribute('aria-label', 'Upcoming batch enrolment');
  popup.innerHTML = `<div class="welcome-popup-card"><div class="welcome-popup-top">LIMITED SEATS FOR THE UPCOMING BATCH</div><button class="welcome-popup-close" type="button" aria-label="Close enrolment notice">×</button><div class="welcome-popup-content"><h2>Only a few seats<br>left to <em>enrol.</em></h2><p>Join RV Consulting's latest upcoming batch for practical AML, KYC, fraud and crypto investigation training.</p><p class="welcome-goal">Make a focused choice today and achieve your career goals with better guidance.</p><div class="welcome-popup-actions"><a class="button" href="https://wa.me/919717766543?text=Hi%20RV%20Consulting%2C%20I%20want%20to%20enrol%20for%20the%20upcoming%20batch." target="_blank" rel="noopener">Enrol on WhatsApp <span>→</span></a><a class="button welcome-call" href="tel:+919717766543">Call us <span>→</span></a></div><a class="welcome-explore" href="#enrolment">Explore programme details →</a></div></div>`;
  document.body.append(popup);
  const dismiss = () => { sessionStorage.setItem(welcomePopupKey, 'true'); popup.remove(); };
  popup.querySelector('.welcome-popup-close').addEventListener('click', dismiss);
  popup.querySelector('.welcome-explore').addEventListener('click', dismiss);
  popup.addEventListener('click', (event) => { if (event.target === popup) dismiss(); });
  popup.querySelector('.welcome-popup-close').focus();
};
window.setTimeout(showWelcomePopup, 450);

window.setTimeout(() => {
  const learningSection = document.querySelector('#learning-experience');
  if (learningSection && !learningSection.querySelector('.support-info')) {
    learningSection.insertAdjacentHTML('beforeend', `<div class="support-info"><div class="course-format-panel"><h3>Course format</h3><p>Learn through focused instruction and practical application, so each topic is connected to real financial-crime work.</p><div class="course-format-list"><span>Live guided learning</span><span>Case-study practice</span><span>Revision support</span><span>Reporting exercises</span></div></div><div class="policy-panel"><h3>Support timing</h3><p>Monday to Saturday<br><strong>10:00 AM – 7:00 PM IST</strong></p><p>For course, demo-class and enrolment guidance, <a href="https://wa.me/919717766543" target="_blank" rel="noopener">message us on WhatsApp</a> or call directly.</p></div></div>`);
  }
  const faqList = document.querySelector('#faq .faq-list');
  if (faqList && !faqList.querySelector('[data-policy-question]')) {
    faqList.insertAdjacentHTML('beforeend', `<details data-policy-question><summary>What are the payment and refund terms?</summary><p>We encourage you to choose your programme with full clarity, and our team is happy to guide you before payment. Once a payment is made, course, study-material and related-service fees are non-refundable. Please review the Cancellation &amp; Refund Policy and confirm your course and payment arrangement with RV Consulting before enrolling.</p></details><details data-policy-question><summary>How is my enquiry information used?</summary><p>Your enquiry details are used to respond to your course request and provide relevant guidance. Do not share sensitive information through public forms or chats.</p></details><details data-policy-question><summary>Does career support guarantee a job?</summary><p>Career support is guidance for preparation and job-relevant skills. It does not guarantee employment, an interview or an offer.</p></details>`);
  }
}, 0);

const footerLinks = document.querySelector('footer div');
if (footerLinks && !footerLinks.querySelector('[data-legal-link]')) {
  footerLinks.insertAdjacentHTML('beforeend', `
    <a data-legal-link href="terms.html">Terms &amp; Conditions</a>
    <a data-legal-link href="privacy.html">Privacy Policy</a>
    <a data-legal-link href="refund-policy.html">Cancellation &amp; Refund</a>
  `);
}

const founderSection = document.querySelector('.founder-section');
if (founderSection && !document.querySelector('#learning-experience')) {
  founderSection.insertAdjacentHTML('beforebegin', `<section class="learning-info section" id="learning-experience"><div class="learning-info-intro"><div><p class="eyebrow"><i></i> LEARNING EXPERIENCE</p><h2>Clear guidance for<br>real career goals.</h2></div><p>Build practical confidence step by step, with a focused route from course selection to investigation-ready skills.</p></div><div class="learning-info-grid"><article class="learning-info-card"><span>01</span><h3>Who it’s for</h3><p>Designed for learners exploring financial-crime and compliance careers.</p><ul><li>Freshers and career starters</li><li>Banking and operations professionals</li><li>Professionals moving into AML/KYC</li></ul></article><article class="learning-info-card"><span>02</span><h3>How you learn</h3><p>Structured lessons connect core concepts with practical investigation work.</p><ul><li>Live learning and guided revision</li><li>Case studies and scenario practice</li><li>Clear notes and reporting exercises</li></ul></article><article class="learning-info-card"><span>03</span><h3>Support you receive</h3><p>Get help choosing the right track and understanding the next steps.</p><ul><li>Course-selection guidance</li><li>Demo-class and enrolment support</li><li>Career-preparation guidance</li></ul></article></div></section><section class="faq-section section" id="faq"><div class="faq-section-head"><div><p class="eyebrow"><i></i> FREQUENTLY ASKED QUESTIONS</p><h2>Answers before you<br>take the next step.</h2></div><p>Need more clarity? Contact RV Consulting on WhatsApp or call for one-to-one guidance.</p></div><div class="faq-list"><details><summary>Who can join these programmes?</summary><p>The programmes are suitable for freshers, professionals in banking or operations, and anyone building AML, KYC, fraud or crypto-investigation knowledge.</p></details><details><summary>Do I need previous AML or KYC experience?</summary><p>No. The learning path starts with essential concepts and moves into practical review and investigation exercises.</p></details><details><summary>What is the learning format?</summary><p>Training combines structured lessons, practical scenarios, guided revision and exercises that support investigation-ready understanding.</p></details><details><summary>Is there a demo class available?</summary><p>Yes. Contact RV Consulting for details on the next demo class and how to join.</p></details><details><summary>What does career support include?</summary><p>Support focuses on course selection, career preparation and guidance for developing job-relevant investigation skills. Contact the team for current details.</p></details><details><summary>How can I request study material or enrol?</summary><p>Use the WhatsApp buttons on the website or call RV Consulting directly. The team can guide you one-to-one on the appropriate next step.</p></details></div></section>`);
}

const learningSection = document.querySelector('#learning-experience');
if (learningSection && !document.querySelector('#trainers')) {
  learningSection.insertAdjacentHTML('afterend', `<section class="trainers-section section" id="trainers"><div class="trainers-intro"><div><p class="eyebrow"><i></i> MEET YOUR TRAINERS</p><h2>Learn with certified<br>industry-focused mentors.</h2></div><p>Our trainers help turn complex financial-crime topics into clear, practical learning you can apply with confidence.</p></div><div class="trainer-grid"><article class="trainer-card"><span class="trainer-mark">01</span><h3>Certified trainers</h3><p>Learn from qualified trainers with a structured, professional approach to AML, KYC and financial-crime education.</p><ul><li>Concepts explained clearly</li><li>Guided learning path</li><li>Focused doubt support</li></ul></article><article class="trainer-card"><span class="trainer-mark">02</span><h3>Practical perspective</h3><p>Sessions connect theory with real-world investigation thinking, documentation and risk-review practices.</p><ul><li>Scenario-led discussion</li><li>Case-study practice</li><li>Reporting awareness</li></ul></article><article class="trainer-card"><span class="trainer-mark">03</span><h3>Career-minded guidance</h3><p>Get direction on building relevant skills, preparing for roles and choosing the learning path that fits you.</p><ul><li>One-to-one course guidance</li><li>Interview preparation support</li><li>Learning progress direction</li></ul></article></div><a class="trainer-contact" href="https://wa.me/919717766543?text=Hello%20RV%20Consulting%2C%20I%20would%20like%20to%20know%20more%20about%20the%20trainers.">Ask about our trainers &rarr;</a></section>`);
}

window.setTimeout(() => {
  const faqList = document.querySelector('#faq .faq-list');
  if (faqList && !faqList.querySelector('[data-instalment-question]')) {
    faqList.insertAdjacentHTML('beforeend', `<details data-instalment-question><summary>Can I pay my course fee in instalments?</summary><p>Yes. You can divide the total course fee equally across the course duration. For example, for a 4-month course priced at ₹40,000, you can pay ₹10,000 per month. The monthly instalment is calculated by dividing the total course fee by the number of course months. Contact RV Consulting to confirm the instalment schedule for your selected course.</p></details>`);
  }
}, 0);

window.setTimeout(() => {
  const faqSection = document.querySelector('#faq');
  const faqList = faqSection?.querySelector('.faq-list');
  const allFaqs = faqList ? Array.from(faqList.querySelectorAll('details')) : [];
  if (!faqSection || allFaqs.length <= 4 || document.querySelector('#faq-modal')) return;
  const remainingFaqs = allFaqs.slice(4).map((item) => item.outerHTML).join('');
  allFaqs.slice(4).forEach((item) => item.remove());
  const action = document.createElement('div');
  action.className = 'faq-view-all';
  action.innerHTML = '<button class="button" type="button" id="faq-view-all">View all FAQs <span>→</span></button>';
  faqList.insertAdjacentElement('afterend', action);
  const modal = document.createElement('div');
  modal.className = 'faq-modal';
  modal.id = 'faq-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'faq-modal-title');
  modal.innerHTML = `<div class="faq-modal-card"><button class="faq-modal-close" type="button" aria-label="Close all FAQs">×</button><h2 id="faq-modal-title">More answers</h2><p>Everything you may want to know before starting your learning journey.</p><div class="faq-list">${remainingFaqs}</div></div>`;
  document.body.append(modal);
  const showFaqModal = () => { modal.hidden = false; modal.querySelector('.faq-modal-close')?.focus(); };
  const hideFaqModal = () => { modal.hidden = true; action.querySelector('button')?.focus(); };
  action.querySelector('button')?.addEventListener('click', showFaqModal);
  modal.querySelector('.faq-modal-close')?.addEventListener('click', hideFaqModal);
  modal.addEventListener('click', (event) => { if (event.target === modal) hideFaqModal(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) hideFaqModal(); });
}, 0);
const mobileMenuToggle = document.querySelector('#mobile-menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');

const closeMobileMenu = () => {
  if (!mobileMenu || !mobileMenuToggle) return;
  mobileMenu.hidden = true;
  mobileMenuToggle.classList.remove('is-open');
  mobileMenuToggle.setAttribute('aria-expanded', 'false');
  mobileMenuToggle.setAttribute('aria-label', 'Open menu');
};

mobileMenuToggle?.addEventListener('click', () => {
  const isOpen = !mobileMenu.hidden;
  mobileMenu.hidden = isOpen;
  mobileMenuToggle.classList.toggle('is-open', !isOpen);
  mobileMenuToggle.setAttribute('aria-expanded', String(!isOpen));
  mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
});

mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));
window.addEventListener('resize', () => { if (window.innerWidth > 760) closeMobileMenu(); });
