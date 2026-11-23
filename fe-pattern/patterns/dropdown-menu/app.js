// Accessible dropdown menu — WAI-ARIA 1.2 "menu" pattern.
//
// Structure:
//   - A menu <button> with aria-haspopup="menu", aria-expanded, and aria-controls.
//   - A <ul role="menu"> of <li role="none"> buttons (role="menuitem").
//
// Keyboard (ARIA authoring practices for menus):
//   - Enter / Space / ArrowDown : open, focus first item
//   - ArrowUp / Home / End       : open, focus last item
//   - ArrowDown / ArrowUp        : move within menu (wraps, skips separators)
//   - Home / End                 : first / last item
//   - Escape                     : close, return focus to the trigger
//   - Tab                        : close (focus leaves with Tab)
//   - Printable characters       : type-ahead jump to first matching item
//
// Focus management:
//   - Opened by keyboard -> focus moves to the first/last item.
//   - Opened by mouse    -> focus stays on the trigger button.
//
// When closed, the menu is hidden with `hidden`, so its items leave the
// accessibility tree and the tab order.

const trigger = document.getElementById('menu-trigger');
const menu = document.getElementById('menu-list');
const container = document.querySelector('.menu');
const items = [...menu.querySelectorAll('[role="menuitem"]')];
const lastAction = document.getElementById('last-action');

// Tracks how the menu was opened, so focus is managed correctly.
let keyboardOpen = false;

function openMenu() {
  menu.hidden = false;
  trigger.setAttribute('aria-expanded', 'true');
}

function closeMenu(returnFocus = true) {
  menu.hidden = true;
  trigger.setAttribute('aria-expanded', 'false');
  if (returnFocus) trigger.focus();
}

function first() { items[0]?.focus(); }
function last() { items[items.length - 1]?.focus(); }

// Move within the menu, wrapping around. No-op if focus isn't on an item
// (e.g. the menu was opened by mouse, so focus is still on the trigger).
function move(dir) {
  const idx = items.indexOf(document.activeElement);
  if (idx === -1) return;
  const next = ((idx + dir) % items.length + items.length) % items.length;
  items[next]?.focus();
}

// Type-ahead: jump to the first item whose label starts with the key.
function typeAhead(query) {
  const match = items.find(
    (it) => it.textContent.trim().toLowerCase().startsWith(query)
  );
  match?.focus();
}

// Open / close on trigger click (mouse). Focus stays on the trigger.
trigger.addEventListener('click', () => {
  keyboardOpen = false;
  menu.hidden ? openMenu() : closeMenu();
});

// All keyboard handling lives here (the trigger is a descendant of `container`),
// so a key event is processed exactly once.
container.addEventListener('keydown', (e) => {
  const key = e.key;
  const isTrigger = document.activeElement === trigger;

  // Menu closed, trigger focused: open on Enter / Space / arrows.
  if (menu.hidden) {
    if (
      isTrigger &&
      ['Enter', ' ', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)
    ) {
      e.preventDefault();
      keyboardOpen = true;
      openMenu();
      if (key === 'ArrowUp' || key === 'End') last();
      else first();
    }
    return;
  }

  // Menu open.
  if (key === 'Escape') {
    e.preventDefault();
    keyboardOpen = false;
    closeMenu();
    return;
  }
  if (key === 'Tab') {
    closeMenu(false); // close; let focus move away with Tab
    return;
  }
  if (document.activeElement?.getAttribute('role') === 'menuitem') {
    switch (key) {
      case 'ArrowDown': e.preventDefault(); move(1); break;
      case 'ArrowUp': e.preventDefault(); move(-1); break;
      case 'Home': e.preventDefault(); first(); break;
      case 'End': e.preventDefault(); last(); break;
      default:
        // Printable character -> type-ahead.
        if (key.length === 1 && /[!-~]/.test(key)) {
          e.preventDefault();
          typeAhead(key.toLowerCase());
        }
    }
  }
});

// Selecting an item records it and closes the menu.
items.forEach((item) => {
  item.addEventListener('click', () => {
    lastAction.textContent = `Action: ${item.dataset.action}`;
    lastAction.classList.add('seen');
    closeMenu();
  });
});

// Click outside the menu closes it.
document.addEventListener('click', (e) => {
  if (!menu.hidden && !container.contains(e.target) && e.target !== trigger) {
    closeMenu();
  }
});
