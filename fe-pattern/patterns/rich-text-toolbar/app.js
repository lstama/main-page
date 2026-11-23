// Rich Text Toolbar
// A floating toolbar that appears over the current text selection and applies
// formatting via the browser's native editing commands.
(function () {
  'use strict';

  const editor = document.getElementById('editor');
  const toolbar = document.getElementById('toolbar');
  const log = document.getElementById('log');
  const buttons = Array.from(toolbar.querySelectorAll('.tb-btn'));

  let hideTimer = null;
  // After a button click, ignore selection changes briefly so the toolbar
  // doesn't snap back while the (possibly still present) selection lingers.
  let suppressUntil = 0;

  function positionToolbar() {
    const sel = window.getSelection();
    if (sel.rangeCount === 0 || sel.isCollapsed) {
      hideToolbar();
      return;
    }
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) {
      hideToolbar();
      return;
    }
    const rect = range.getBoundingClientRect();
    clearTimeout(hideTimer);
    toolbar.hidden = false;
    // Force a frame so the transition can run from the hidden state.
    requestAnimationFrame(() => toolbar.classList.remove('is-hiding'));
    const tw = toolbar.offsetWidth;
    const th = toolbar.offsetHeight;
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - tw / 2, window.innerWidth - tw - 8));
    const top = rect.top - th - 10;
    toolbar.style.left = left + 'px';
    toolbar.style.top = (top > 0 ? top : rect.bottom + 10) + 'px';
  }

  function hideToolbar() {
    toolbar.classList.add('is-hiding');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { toolbar.hidden = true; }, 150);
  }

  function refreshActive() {
    buttons.forEach((btn) => {
      const cmd = btn.dataset.cmd;
      if (cmd === 'createLink') return;
      btn.classList.toggle('active', document.queryCommandState(cmd));
    });
  }

  function apply(cmd, arg) {
    suppressUntil = Date.now() + 600;
    editor.focus();
    document.execCommand(cmd, false, arg);
    refreshActive();
    hideToolbar();
    log.textContent = 'Applied: ' + cmd + (arg ? ' → ' + arg : '');
  }

  // Clicking a button must not steal focus from the contenteditable (which
  // would collapse the selection). Cancel the mousedown, keep the click.
  toolbar.addEventListener('mousedown', (e) => e.preventDefault());

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tb-btn');
    if (!btn) return;
    const cmd = btn.dataset.cmd;
    if (cmd === 'createLink') {
      const url = prompt('Enter URL (will use http:// if omitted):', 'https://');
      if (url) apply('createLink', url);
    } else {
      apply(cmd);
    }
  });

  editor.addEventListener('keyup', refreshActive);

  // selectionchange fires on document and does not bubble, so listen there.
  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    const hasValid =
      sel.rangeCount > 0 && !sel.isCollapsed && editor.contains(sel.anchorNode);
    if (hasValid && Date.now() >= suppressUntil) {
      positionToolbar();
    } else {
      hideToolbar();
    }
  });

  // Keyboard shortcuts.
  editor.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); apply('bold'); break;
        case 'i': e.preventDefault(); apply('italic'); break;
        case 'u': e.preventDefault(); apply('underline'); break;
        default: break;
      }
    }
  });

  // A fresh user selection (mouseup) re-shows the toolbar immediately.
  editor.addEventListener('mouseup', () => positionToolbar());

  // Hide the toolbar when focus leaves the editor (selection usually leaves too).
  editor.addEventListener('blur', () => positionToolbar());

  refreshActive();
})();
