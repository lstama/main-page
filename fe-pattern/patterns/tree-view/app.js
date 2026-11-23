/* Tree View
 * A nested file tree with tree/treeitem ARIA roles, full keyboard support
 * (arrows to move, Home/End to jump, Enter/Space to expand folders), click to
 * select, chevron to expand, and persisted expanded/selected state in
 * localStorage.
 */

const STORAGE_KEY = 'fe-pattern-tree-view-state';

const TREE_DATA = [
  {
    id: 'src', label: 'src', type: 'folder', children: [
      { id: 'src-app', label: 'app.js', type: 'file' },
      {
        id: 'src-components', label: 'components', type: 'folder', children: [
          { id: 'btn', label: 'Button.jsx', type: 'file' },
          { id: 'card', label: 'Card.jsx', type: 'file' },
          { id: 'modal', label: 'Modal.tsx', type: 'file' },
        ],
      },
      {
        id: 'src-utils', label: 'utils', type: 'folder', children: [
          { id: 'fmt', label: 'format.ts', type: 'file' },
          { id: 'dom', label: 'dom.ts', type: 'file' },
        ],
      },
    ],
  },
  {
    id: 'public', label: 'public', type: 'folder', children: [
      { id: 'idx', label: 'index.html', type: 'file' },
      { id: 'fav', label: 'favicon.ico', type: 'file' },
    ],
  },
  { id: 'pkg', label: 'package.json', type: 'file' },
  { id: 'cfg', label: 'vite.config.ts', type: 'file' },
  { id: 'readme', label: 'README.md', type: 'file' },
];

const $ = (id) => document.getElementById(id);
const treeEl = $('tree');
const inputEl = $('tree-input');

const state = {
  expanded: new Set(), // folder ids
  selected: null, // node id
};

/* ---------- persistence ---------- */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.expanded && Array.isArray(data.expanded)) {
      data.expanded.forEach((id) => state.expanded.add(id));
    }
    if (typeof data.selected === 'string') state.selected = data.selected;
  } catch (e) {
    /* ignore corrupt storage */
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      expanded: [...state.expanded],
      selected: state.selected,
    }));
  } catch (e) {
    /* storage may be unavailable; non-fatal */
  }
}

/* ---------- helpers ---------- */
function findNode(id, nodes = TREE_DATA) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const hit = findNode(id, n.children);
      if (hit) return hit;
    }
  }
  return null;
}

function isFolder(n) {
  return n && n.type === 'folder';
}

function iconFor(node) {
  if (isFolder(node)) return node.expanded || state.expanded.has(node.id) ? '📂' : '📁';
  return '📄';
}

/* Visible nodes: a node is visible if every ancestor is expanded (or it is root). */
function collectVisible(nodes, depth, out) {
  for (const n of nodes) {
    out.push({ node: n, depth });
    if (isFolder(n) && (state.expanded.has(n.id))) {
      collectVisible(n.children || [], depth + 1, out);
    }
  }
  return out;
}

/* ---------- render ---------- */
function render() {
  treeEl.innerHTML = '';
  renderChildren(TREE_DATA, 0, treeEl);
  applySelection();
}

function renderChildren(nodes, depth, parentEl) {
  nodes.forEach((n) => {
    const li = document.createElement('li');
    li.className = 'tree-node';
    li.setAttribute('role', 'treeitem');
    li.setAttribute('data-id', n.id);
    li.style.setProperty('--depth', String(depth));

    const folder = isFolder(n);
    if (folder) {
      li.setAttribute('aria-expanded', state.expanded.has(n.id) ? 'true' : 'false');
    }
    if (state.selected === n.id) {
      li.setAttribute('aria-selected', 'true');
    }
    li.setAttribute('tabindex', '0');

    const content = document.createElement('div');
    content.className = 'tree-content';

    if (folder) {
      const btn = document.createElement('button');
      btn.className = 'chevron';
      btn.type = 'button';
      btn.setAttribute('aria-label', state.expanded.has(n.id) ? 'Collapse' : 'Expand');
      btn.setAttribute('tabindex', '-1');
      btn.innerHTML = '<span class="glyph">▸</span>';
      content.appendChild(btn);
      if (state.expanded.has(n.id)) li.classList.add('is-expanded');
    } else {
      const gutter = document.createElement('span');
      gutter.className = 'leaf-gutter';
      content.appendChild(gutter);
    }

    const icon = document.createElement('span');
    icon.className = 'node-icon';
    icon.textContent = iconFor(n);
    content.appendChild(icon);

    const label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = n.label;
    content.appendChild(label);

    li.appendChild(content);

    parentEl.appendChild(li);

    if (folder) {
      const ul = document.createElement('ul');
      ul.className = 'tree-children';
      ul.setAttribute('role', 'group');
      if (state.expanded.has(n.id)) renderChildren(n.children || [], depth + 1, ul);
      else ul.style.display = 'none';
      li.appendChild(ul);
    }
  });
}

function toggleExpand(id) {
  if (state.expanded.has(id)) state.expanded.delete(id);
  else state.expanded.add(id);
  saveState();
  refreshNode(id);
}

function selectNode(id) {
  state.selected = id;
  saveState();
  applySelection();
}

/* Local refresh: update a single node's attributes/classes without full re-render,
 * so keyboard focus is preserved. */
function refreshNode(id) {
  const li = treeEl.querySelector(`[data-id="${id}"]`);
  if (!li) return;
  const node = findNode(id);
  if (!node) return;

  if (isFolder(node)) {
    const expanded = state.expanded.has(id);
    li.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    li.classList.toggle('is-expanded', expanded);
    const btn = li.querySelector('.chevron');
    if (btn) btn.setAttribute('aria-label', expanded ? 'Collapse' : 'Expand');
    const glyph = li.querySelector('.chevron .glyph');
    if (glyph) glyph.textContent = '▸';
    const ul = li.querySelector('.tree-children');
    if (ul) {
      ul.style.display = expanded ? '' : 'none';
      if (expanded && !ul.dataset.built) {
        renderChildren(node.children || [], depthOf(li) + 1, ul);
        ul.dataset.built = '1';
      }
    }
  }
}

function depthOf(li) {
  return parseInt(li.style.getPropertyValue('--depth') || '0', 10);
}

function applySelection() {
  treeEl.querySelectorAll('[role="treeitem"]').forEach((li) => {
    const selected = li.dataset.id === state.selected;
    li.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  const sel = state.selected ? findNode(state.selected) : null;
  inputEl.value = sel ? sel.label : '(none)';
  // Keep the selected node in view.
  if (sel) {
    const li = treeEl.querySelector(`[data-id="${state.selected}"]`);
    if (li) li.scrollIntoView({ block: 'nearest' });
  }
}

/* ---------- keyboard ---------- */
function visibleList() {
  return collectVisible(TREE_DATA, 0, []);
}

function handleKey(e) {
  const target = e.target.closest('[role="treeitem"]');
  const list = visibleList();
  const currentId = target ? target.dataset.id : null;
  const idx = currentId ? list.findIndex((v) => v.node.id === currentId) : -1;

  let handled = true;
  switch (e.key) {
    case 'ArrowDown': {
      const next = list[idx + 1] || list[0];
      if (next) focusNode(next.node.id);
      else e.preventDefault();
      break;
    }
    case 'ArrowUp': {
      const prev = idx > 0 ? list[idx - 1] : list[list.length - 1];
      if (prev) focusNode(prev.node.id);
      else e.preventDefault();
      break;
    }
    case 'Home': {
      if (list[0]) focusNode(list[0].node.id);
      break;
    }
    case 'End': {
      if (list[list.length - 1]) focusNode(list[list.length - 1].node.id);
      break;
    }
    case 'ArrowRight': {
      const cur = list[idx];
      if (!cur) { handled = false; break; }
      if (isFolder(cur.node) && !state.expanded.has(cur.node.id)) {
        toggleExpand(cur.node.id);
        focusNode(cur.node.id);
      } else if (isFolder(cur.node) && state.expanded.has(cur.node.id)) {
        // Expanded folder: move into first child if visible, else next sibling.
        const firstChild = findFirstVisibleChild(cur.node.id);
        if (firstChild) focusNode(firstChild.id);
        else { const next = list[idx + 1]; if (next) focusNode(next.node.id); }
      } else {
        const next = list[idx + 1];
        if (next) focusNode(next.node.id);
      }
      break;
    }
    case 'ArrowLeft': {
      const cur = list[idx];
      if (!cur) { handled = false; break; }
      if (isFolder(cur.node) && state.expanded.has(cur.node.id)) {
        // Collapse, stay on it.
        toggleExpand(cur.node.id);
        focusNode(cur.node.id);
      } else if (idx > 0) {
        const parent = findParent(cur.node.id);
        if (parent && parent.id === list[idx - 1].node.id) {
          focusNode(parent.id);
        } else {
          const prev = list[idx - 1];
          focusNode(prev.node.id);
        }
      }
      break;
    }
    case 'Enter':
    case ' ':
      e.preventDefault();
      if (isFolder(findNode(currentId))) toggleExpand(currentId);
      else selectNode(currentId);
      break;
    default:
      handled = false;
  }
  if (handled) e.preventDefault();
}

function focusNode(id) {
  const li = treeEl.querySelector(`[data-id="${id}"]`);
  if (li) li.focus({ preventScroll: true });
}

function findFirstVisibleChild(folderId) {
  const li = treeEl.querySelector(`[data-id="${folderId}"]`);
  if (!li) return null;
  const ul = li.querySelector('.tree-children');
  const first = ul && ul.firstElementChild;
  return first ? { id: first.dataset.id } : null;
}

function findParent(id, nodes = TREE_DATA, parent = null) {
  for (const n of nodes) {
    if (n.id === id) return parent;
    if (n.children) {
      const hit = findParent(id, n.children, n);
      if (hit !== undefined) return hit;
    }
  }
  return undefined;
}

/* ---------- actions ---------- */
function collectFolders(nodes, out) {
  out = out || [];
  nodes.forEach((n) => {
    if (isFolder(n)) {
      out.push(n.id);
      if (n.children) collectFolders(n.children, out);
    }
  });
  return out;
}

function expandAll() {
  collectFolders(TREE_DATA).forEach((id) => state.expanded.add(id));
  saveState();
  render();
}
function collapseAll() {
  state.expanded.clear();
  saveState();
  render();
}
function clearSelection() {
  state.selected = null;
  saveState();
  applySelection();
}

/* ---------- wire up ---------- */
loadState();
render();

treeEl.addEventListener('keydown', handleKey);
treeEl.addEventListener('click', (e) => {
  const li = e.target.closest('[data-id]');
  if (!li || li === treeEl) return;
  const id = li.dataset.id;
  const node = findNode(id);
  if (!node) return;
  if (e.target.closest('.chevron')) {
    toggleExpand(id);
  } else {
    selectNode(id);
    if (isFolder(node)) toggleExpand(id);
  }
});
$('expand-all').addEventListener('click', expandAll);
$('collapse-all').addEventListener('click', collapseAll);
$('clear-sel').addEventListener('click', clearSelection);
