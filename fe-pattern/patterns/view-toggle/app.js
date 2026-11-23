// View Toggle
// Switches a card board between a grid and a list layout. The active layout
// is stored in localStorage and restored on load. Tabs are ARIA tablist tabs
// with arrow-key navigation.
(function () {
  'use strict';

  var STORAGE_KEY = 'fe-pattern:view-toggle';
  var board = document.getElementById('board');
  var segmented = document.getElementById('segmented');
  var tabs = Array.prototype.slice.call(segmented.querySelectorAll('[role="tab"]'));

  var MEMBERS = [
    { name: 'Ada Lovelace', role: 'Analyst', color: '#6366f1', init: 'AL', desc: 'Plans the quarterly routing model and keeps the data pipeline healthy.', tag: 'Analytics', stat: '128 reviews' },
    { name: 'Grace Hopper', role: 'Engineer', color: '#0ea5e9', init: 'GH', desc: 'Ships hotfixes before coffee and writes the docs nobody asked for.', tag: 'Platform', stat: '96 reviews' },
    { name: 'Alan Turing', role: 'Researcher', color: '#e11d48', init: 'AT', desc: 'Explores new heuristic paths and posts them to the internal wiki.', tag: 'Research', stat: '74 reviews' },
    { name: 'Katherine J.', role: 'Lead', color: '#ea580c', init: 'KJ', desc: 'Coordinates cross-team releases and unblocks anyone stuck in CI.', tag: 'Delivery', stat: '142 reviews' },
    { name: 'Margaret H.', role: 'Scientist', color: '#16a34a', init: 'MH', desc: 'Validates model outputs and keeps the test suite green.', tag: 'QA', stat: '88 reviews' },
    { name: 'Dennis R.', role: 'DevOps', color: '#9333ea', init: 'DR', desc: 'Keeps the clusters warm and the dashboards populated.', tag: 'Infra', stat: '61 reviews' },
  ];

  function cardHTML(m) {
    return (
      '<article class="card">' +
        '<div class="card-top">' +
          '<span class="avatar" style="background:' + m.color + '">' + m.init + '</span>' +
          '<div><div class="card-name">' + m.name + '</div><div class="card-role">' + m.role + '</div></div>' +
        '</div>' +
        '<p class="card-desc">' + m.desc + '</p>' +
        '<div class="card-foot"><span class="tag">' + m.tag + '</span><span class="stat">' + m.stat + '</span></div>' +
      '</article>'
    );
  }

  function render() {
    board.innerHTML = MEMBERS.map(cardHTML).join('');
  }

  function applyView(view) {
    board.classList.remove('grid', 'list');
    board.classList.add(view);
    tabs.forEach(function (tab) {
      var on = tab.dataset.view === view;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.classList.toggle('seg-active', on);
    });
    try { localStorage.setItem(STORAGE_KEY, view); } catch (e) {}
  }

  function currentView() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'grid' || saved === 'list') return saved;
    } catch (e) {}
    return 'grid';
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      applyView(tab.dataset.view);
    });
  });

  // Arrow keys rove focus AND select, matching segmented-control expectations.
  segmented.addEventListener('keydown', function (e) {
    var idx = tabs.indexOf(document.activeElement);
    if (idx === -1) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      var dir = e.key === 'ArrowRight' ? 1 : -1;
      var next = (idx + dir + tabs.length) % tabs.length;
      tabs[next].focus();
      applyView(tabs[next].dataset.view);
    }
  });

  render();
  applyView(currentView());
})();
