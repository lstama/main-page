// Calendar Grid
// A monthly calendar with prev/next month navigation, a day-of-week header,
// out-of-month days dimmed, a "today" marker, day selection, and a hover
// preview of the selected-date readout.
(function () {
  'use strict';

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const grid = document.getElementById('grid');
  const title = document.getElementById('title');
  const selectedEl = document.getElementById('selected');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  const today = new Date();
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selected = null; // Date | null
  let hoverDate = null; // Date | null

  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function formatDay(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  }

  function render() {
    title.textContent = MONTHS[viewMonth] + ' ' + viewYear;

    // Build the day-of-week header.
    grid.innerHTML = '';
    DOW.forEach((label) => {
      const th = document.createElement('div');
      th.className = 'dow';
      th.setAttribute('role', 'columnheader');
      th.textContent = label;
      grid.appendChild(th);
    });

    const first = new Date(viewYear, viewMonth, 1);
    const start = new Date(viewYear, viewMonth, 1 - first.getDay());

    // Six weeks (42 cells) keeps the grid stable across months.
    for (let i = 0; i < 42; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const inMonth = date.getMonth() === viewMonth;
      const isToday = sameDay(date, today);
      const isSelected = sameDay(date, selected);

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
      btn.setAttribute('role', 'gridcell');
      btn.setAttribute('aria-label', formatDay(date));
      if (!inMonth) btn.classList.add('other-month');
      if (isToday) btn.classList.add('today');
      if (isSelected) btn.classList.add('selected');

      const num = document.createElement('span');
      num.className = 'day-num';
      num.textContent = date.getDate();
      btn.appendChild(num);

      btn.addEventListener('click', () => selectDate(date));
      btn.addEventListener('mouseover', () => previewDate(date));
      btn.addEventListener('mouseout', () => previewDate(null));

      grid.appendChild(btn);
    }

    updateReadout();
  }

  function selectDate(date) {
    selected = date;
    render();
  }

  function previewDate(date) {
    hoverDate = date;
    updateReadout();
  }

  function updateReadout() {
    const active = hoverDate || selected;
    if (active) {
      const label = sameDay(active, today) ? 'today' : formatDay(active);
      selectedEl.innerHTML = 'Selected: <strong>' + label + '</strong>';
    } else {
      selectedEl.textContent = 'No day selected';
    }
  }

  function changeMonth(delta) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    viewYear = d.getFullYear();
    viewMonth = d.getMonth();
    render();
  }

  prevBtn.addEventListener('click', () => changeMonth(-1));
  nextBtn.addEventListener('click', () => changeMonth(1));

  render();
})();
