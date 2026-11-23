// Emoji Picker
// A text field with an emoji picker: a grid of emojis. Selecting one inserts
// it at the cursor and closes the picker. mousedown is cancelled on the
// toggle and emoji buttons so focus stays in the input (and the cursor is
// preserved). Clicking outside the field or pressing Escape closes it.
(function () {
  'use strict';

  const EMOJIS = [
    ['😀','grinning'],['😁','beaming smile'],['😂','grinning with tears'],['🤣','rolling on the floor laughing'],
    ['😍','heart eyes'],['😘','blowing a kiss'],['🥰','smiling faces'],['😗','smiling'],
    ['🤩','star-struck'],['😎','cool'],['🤔','thinking'],['🥳','party'],
    ['😢','tear'],['😭','loud crying'],['😱','fearful'],['😡','pouting'],
    ['👍','thumbs up'],['👎','thumbs down'],['👏','claps'],['🙌','raising hands'],
    ['🤝','handshake'],['✊','fist'],['👊','oncoming fist'],['🤞','crossed fingers'],
    ['❤️','heart'],['🧡','orange heart'],['💛','yellow heart'],['💚','green heart'],
    ['💙','blue heart'],['💜','purple heart'],['🖤','black heart'],['🤍','white heart'],
    ['🔥','fire'],['⭐','star'],['✨','sparkles'],['🎉','party popper'],
    ['🎂','birthday cake'],['🍕','pizza'],['🍔','burger'],['🍟','fries'],
    ['🍎','apple'],['🍌','banana'],['🍇','grapes'],['🍉','watermelon'],
    ['🐶','dog'],['🐱','cat'],['🐭','mouse'],['🐰','rabbit'],
    ['🦊','fox'],['🐻','bear'],['🐼','panda'],['🐯','tiger'],
    ['🌸','blossom'],['🌵','cactus'],['🌈','rainbow'],['☀️','sun'],
  ];

  const field = document.getElementById('field');
  const input = document.getElementById('input');
  const toggle = document.getElementById('toggle');
  const picker = document.getElementById('picker');
  const grid = document.getElementById('picker-grid');

  const cellById = new Map();

  function render() {
    grid.innerHTML = '';
    cellById.clear();
    EMOJIS.forEach(([emoji, name]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'gridcell';
      btn.textContent = emoji;
      btn.setAttribute('aria-label', name);
      grid.appendChild(btn);
      cellById.set(btn, emoji);
    });
  }

  function insertEmoji(emoji) {
    const start = input.selectionStart != null ? input.selectionStart : input.value.length;
    const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    input.value = before + emoji + after;
    const cursor = start + emoji.length;
    input.setSelectionRange(cursor, cursor);
    input.focus();
    closePicker();
  }

  function openPicker() {
    picker.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    render();
    // Focus the field and put the caret at the end so inserted emojis append
    // predictably. mousedown is cancelled on the grid so focus stays here.
    input.focus();
    const end = input.value.length;
    input.setSelectionRange(end, end);
  }

  function closePicker() {
    picker.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }

  // Cancel mousedown so clicking the toggle/emoji keeps focus (and the cursor)
  // in the input instead of moving it to the button.
  toggle.addEventListener('mousedown', (e) => e.preventDefault());
  grid.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) e.preventDefault();
  });

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    if (picker.hidden) openPicker(); else closePicker();
  });

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (btn && cellById.has(btn)) insertEmoji(cellById.get(btn));
  });

  document.addEventListener('click', (e) => {
    if (!picker.hidden && !field.contains(e.target)) closePicker();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !picker.hidden) closePicker();
  });

  render();
})();
