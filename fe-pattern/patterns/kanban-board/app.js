/* Kanban Board — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var STORAGE_KEY = "fe-pattern-kanban-board";
  var board = document.querySelector(".board");
  if (!board) return;

  var status = document.getElementById("status");
  var resetBtn = document.getElementById("reset");
  var columns = Array.prototype.slice.call(board.querySelectorAll(".column"));
  var zones = Array.prototype.slice.call(board.querySelectorAll(".dropzone"));

  var DEFAULT_CARDS = {
    todo: [
      { id: "c1", text: "Research user needs" },
      { id: "c2", text: "Design wireframes" },
    ],
    "in-progress": [
      { id: "c3", text: "Build kanban component" },
    ],
    done: [
      { id: "c4", text: "Set up project" },
    ],
  };

  // Load saved state or use defaults.
  var state = loadState();

  function loadState() {
    var saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      saved = null;
    }
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fall through to defaults */
      }
    }
    return clone(DEFAULT_CARDS);
  }

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Render all cards from state.
  function render() {
    zones.forEach(function (zone) {
      var col = zone.getAttribute("data-zone");
      zone.innerHTML = "";
      (state[col] || []).forEach(function (card) {
        zone.appendChild(buildCard(card));
      });
    });
    updateCounts();
    announce(state.total() + " cards across " + columns.length + " columns");
  }

  function buildCard(card) {
    var el = document.createElement("div");
    el.className = "card";
    el.setAttribute("draggable", "true");
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", card.text + ". Press arrow keys to move between columns.");
    el.dataset.cardId = card.id;

    var handle = document.createElement("span");
    handle.className = "card-handle";
    handle.textContent = "⋮⋮";
    handle.setAttribute("aria-hidden", "true");

    var text = document.createElement("span");
    text.className = "card-text";
    text.textContent = card.text;

    el.appendChild(handle);
    el.appendChild(text);
    return el;
  }

  function updateCounts() {
    zones.forEach(function (zone) {
      var col = zone.getAttribute("data-zone");
      var count = (state[col] || []).length;
      var countEl = zone.parentElement.querySelector(".column-count");
      if (countEl) countEl.textContent = String(count);
    });
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  function announce(msg) {
    if (status) status.textContent = msg;
  }

  // ---- HTML5 drag-and-drop (mouse + keyboard) ----
  var draggedId = null;

  board.addEventListener("dragstart", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    draggedId = card.dataset.cardId;
    card.classList.add("dragging");
    e.dataTransfer.setData("text/plain", draggedId);
    e.dataTransfer.effectAllowed = "move";
  });

  board.addEventListener("dragend", function (e) {
    var card = e.target.closest(".card");
    if (card) card.classList.remove("dragging");
    draggedId = null;
    zones.forEach(function (z) {
      z.classList.remove("drag-over");
    });
  });

  board.addEventListener("dragover", function (e) {
    var zone = e.target.closest(".dropzone");
    if (!zone) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    zones.forEach(function (z) {
      z.classList.remove("drag-over");
    });
    zone.classList.add("drag-over");
  });

  board.addEventListener("drop", function (e) {
    var zone = e.target.closest(".dropzone");
    if (!zone || draggedId === null) return;
    e.preventDefault();
    moveCard(draggedId, zone.getAttribute("data-zone"));
    zones.forEach(function (z) {
      z.classList.remove("drag-over");
    });
  });

  // ---- Keyboard support: arrow keys move focused card ----
  board.addEventListener("keydown", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    var fromCol = columnIndexOf(card);
    if (fromCol < 0) return;

    var toCol = -1;
    if (e.key === "ArrowLeft") {
      toCol = fromCol - 1;
    } else if (e.key === "ArrowRight") {
      toCol = fromCol + 1;
    }
    if (toCol < 0 || toCol >= columns.length) return;

    e.preventDefault();
    var targetZone = zones[toCol];
    moveCard(card.dataset.cardId, targetZone.getAttribute("data-zone"));
    // Focus the card in the new column.
    var newCard = targetZone.querySelector('.card[data-card-id="' + card.dataset.cardId + '"]');
    if (newCard) newCard.focus();
    announce("Moved card to " + columns[toCol].querySelector(".column-title").textContent);
  });

  function columnIndexOf(card) {
    var zone = card.closest(".dropzone");
    if (!zone) return -1;
    return zones.indexOf(zone);
  }

  function moveCard(cardId, targetCol) {
    // Capture the card before removing it, otherwise findCard() below can't locate it.
    var card = findCard(cardId);
    // Remove from current column.
    zones.forEach(function (zone) {
      var col = zone.getAttribute("data-zone");
      if (state[col]) {
        state[col] = state[col].filter(function (c) {
          return c.id !== cardId;
        });
      }
    });
    // Add to target column.
    if (!state[targetCol]) state[targetCol] = [];
    if (card) state[targetCol].push(card);
    save();
    render();
    announce("Card moved to " + columns[zones.indexOf(
      document.querySelector('.dropzone[data-zone="' + targetCol + '"]')
    )].querySelector(".column-title").textContent);
  }

  function findCard(cardId) {
    var found = null;
    zones.forEach(function (zone) {
      var col = zone.getAttribute("data-zone");
      (state[col] || []).forEach(function (c) {
        if (c.id === cardId) found = c;
      });
    });
    return found;
  }

  // ---- Touch support ----
  var touchCard = null;
  var touchClone = null;

  board.addEventListener("touchstart", function (e) {
    var card = e.target.closest(".card");
    if (!card) return;
    touchCard = card;
    card.classList.add("dragging");
  }, { passive: true });

  board.addEventListener("touchmove", function (e) {
    if (!touchCard) return;
    var touch = e.touches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var zone = el ? el.closest(".dropzone") : null;

    zones.forEach(function (z) {
      z.classList.remove("drag-over");
    });
    if (zone) {
      zone.classList.add("drag-over");
    }
  }, { passive: true });

  board.addEventListener("touchend", function (e) {
    if (!touchCard) return;
    var touch = e.changedTouches[0];
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    var zone = el ? el.closest(".dropzone") : null;
    touchCard.classList.remove("dragging");
    zones.forEach(function (z) {
      z.classList.remove("drag-over");
    });
    if (zone) {
      moveCard(touchCard.dataset.cardId, zone.getAttribute("data-zone"));
    }
    touchCard = null;
  }, { passive: true });

  // ---- Reset ----
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      state = clone(DEFAULT_CARDS);
      save();
      render();
      announce("Board reset to default");
    });
  }

  // Initialize.
  state.total = function () {
    var total = 0;
    Object.keys(state).forEach(function (k) {
      total += (state[k] || []).length;
    });
    return total;
  };
  render();
})();
