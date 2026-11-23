// Infinite Scroll Feed
// Lazy-loads chunks of posts into a FIXED pool of card nodes. As new posts
// arrive, the oldest card is recycled (its content replaced in place), so the
// DOM never grows — the document holds exactly WINDOW cards at all times.

const feed = document.getElementById('feed');
const sentinel = document.getElementById('sentinel');
const loader = document.getElementById('loader');
const countEl = document.getElementById('count');
const resetBtn = document.getElementById('reset');

const CHUNK = 6; // posts revealed per load
const WINDOW = 8; // fixed number of card nodes kept in the DOM
const TOTAL = 200; // stop after this many (simulates end of data)

const NAMES = [
  'Ada Lovelace', 'Alan Turing', 'Grace Hopper', 'Katherine Johnson',
  'Linus Torvalds', 'Margaret Hamilton', 'Dennis Ritchie', 'Karen Sparrick',
  'Barbara Liskov', 'Tim Berners-Lee', 'Radia Perlman', 'Claude Shannon',
];
const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const SAMPLE_TEXTS = [
  'Just shipped a small refactor that cut render time in half. Small wins add up.',
  'Reminder: premature optimization is the root of most slow code — measure first.',
  'The best error message is the one that never needs to be written.',
  'Read code daily. Even 10 minutes a day keeps the patterns coming.',
  'Accessibility is not a feature; it is a foundation. Build it early.',
  'Deploying on Friday — and by that I mean I love chaos and short evenings.',
  'CSS is powerful, but knowing when NOT to reach for it matters more.',
  'The compiler is not your enemy; it is your first reviewer.',
];

let loaded = 0;
let busy = false;
let poolIndex = 0;
let liked = new Set();
const pool = [];

function hash(str) {
  let n = 0;
  for (let i = 0; i < str.length; i++) n = (n * 31 + str.charCodeAt(i)) >>> 0;
  return n;
}

function relativeTime(index) {
  const mins = (loaded + index) % 60;
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function buildCardHTML(post, likedNow) {
  const initials = post.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  const color = COLORS[hash(post.name) % COLORS.length];
  return `
    <div class="card-head">
      <div class="avatar" style="background:${color}">${initials}</div>
      <div class="card-meta">
        <div class="name">${post.name}</div>
        <div class="time">${relativeTime(post.id)}</div>
      </div>
    </div>
    ${post.media ? `<div class="card-media" style="background-image:url('${post.media}')"></div>` : ''}
    <div class="card-body">
      <p>${post.text}</p>
      <div class="card-actions">
        <button type="button" data-act="like" aria-pressed="${likedNow}">
          ${likedNow ? '♥' : '♡'} ${post.likes + (likedNow ? 1 : 0)}
        </button>
        <button type="button" data-act="comment">💬 ${post.comments}</button>
        <button type="button" data-act="share">↪ Share</button>
      </div>
    </div>`;
}

function renderCard(card, post) {
  card.className = 'card is-animating';
  card.innerHTML = buildCardHTML(post, liked.has(post.id));
  card.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    if (btn.dataset.act === 'like') {
      if (liked.has(post.id)) liked.delete(post.id);
      else liked.add(post.id);
      const b = card.querySelector('[data-act="like"]');
      const on = liked.has(post.id);
      b.textContent = `${on ? '♥' : '♡'} ${post.likes + (on ? 1 : 0)}`;
      b.setAttribute('aria-pressed', on);
    }
  });
}

function makePost(id) {
  const name = NAMES[id % NAMES.length];
  return {
    id,
    name,
    text: SAMPLE_TEXTS[id % SAMPLE_TEXTS.length],
    likes: hash(name) % 500,
    comments: hash(name) % 80,
    media: id % 3 === 0 ? null : `https://picsum.photos/seed/${id}/640/360`,
  };
}

function loadChunk() {
  if (busy || loaded >= TOTAL) return;
  busy = true;
  loader.classList.remove('is-hidden');

  setTimeout(() => {
    for (let i = 0; i < CHUNK && loaded < TOTAL; i++) {
      const card = pool[poolIndex]; // recycle the oldest node in the pool
      renderCard(card, makePost(loaded));
      poolIndex = (poolIndex + 1) % WINDOW;
      loaded++;
    }
    countEl.textContent = `${loaded} posts loaded`;

    if (loaded >= TOTAL) {
      loader.innerHTML = '<span>All posts loaded</span>';
      observer.disconnect();
    } else {
      loader.classList.add('is-hidden');
    }
    busy = false;
  }, 350);
}

const observer = new IntersectionObserver(
  (entries) => {
    if (entries.some((e) => e.isIntersecting)) loadChunk();
  },
  { rootMargin: '400px' }
);

// Build the fixed pool of card nodes up front.
for (let i = 0; i < WINDOW; i++) {
  const card = document.createElement('article');
  feed.appendChild(card);
  pool.push(card);
}

observer.observe(sentinel);

// Fallback: if the observer never fires (e.g. sentinel off-screen at load),
// kick off the first chunk after a short delay.
setTimeout(() => { if (loaded === 0 && !busy) loadChunk(); }, 500);

resetBtn.addEventListener('click', () => {
  loaded = 0;
  poolIndex = 0;
  liked.clear();
  busy = false;
  loader.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
  loader.classList.remove('is-hidden');
  observer.disconnect();
  observer.observe(sentinel);
  loadChunk();
});
