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
