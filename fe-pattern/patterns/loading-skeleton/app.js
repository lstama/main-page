// Loading skeleton pattern.
// Renders placeholder "skeleton" cards, simulates a network delay, then swaps in real content.
const grid = document.getElementById('grid');
const reloadBtn = document.getElementById('reload');

const SAMPLE = [
  { name: 'Ada Lovelace', role: 'Engineer' },
  { name: 'Alan Turing', role: 'Researcher' },
  { name: 'Grace Hopper', role: 'Lead' },
  { name: 'Katherine Johnson', role: 'Analyst' },
];

function renderSkeletons(n) {
  grid.innerHTML = Array.from({ length: n }, () => `
    <div class="card">
      <span class="skeleton skeleton-avatar" aria-hidden="true"></span>
      <span class="skeleton skeleton-title" aria-hidden="true"></span>
      <span class="skeleton skeleton-line" aria-hidden="true"></span>
      <span class="skeleton skeleton-line short" aria-hidden="true"></span>
    </div>`).join('');
}

function renderContent(data) {
  grid.innerHTML = data
    .map(
      (p) => `
    <div class="card">
      <div class="card-name">${p.name}</div>
      <div class="card-role">${p.role}</div>
    </div>`
    )
    .join('');
}

// Simulate a fetch: skeletons first, then real data after a delay.
function load() {
  renderSkeletons(SAMPLE.length);
  reloadBtn.disabled = true;
  setTimeout(() => {
    renderContent(SAMPLE);
    reloadBtn.disabled = false;
  }, 1400);
}

reloadBtn.addEventListener('click', load);
load();
