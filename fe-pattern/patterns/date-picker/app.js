/* Date Picker — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var input = document.getElementById("date-input");
  var trigger = document.getElementById("date-trigger");
  var calendar = document.getElementById("date-calendar");
  var daysCell = document.getElementById("cal-days");
  var titleEl = document.getElementById("cal-title");
  var prevBtn = document.getElementById("cal-prev");
  var nextBtn = document.getElementById("cal-next");
  var todayBtn = document.getElementById("cal-today");
  var closeBtn = document.getElementById("cal-close");
  var selectedOutput = document.getElementById("selected-output");

  if (!input || !calendar) return;

  var MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  var view = new Date(); // month being displayed
  var selectedDate = null; // Date object when a date is chosen
  var focusedDate = null; // Date object currently focused in grid

  function ymd(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function startOfMonth(d) {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  function renderCalendar(monthDate) {
    view = new Date(monthDate);
    var year = view.getFullYear();
    var month = view.getMonth();

    titleEl.textContent = MONTHS[month] + " " + year;

    var first = new Date(year, month, 1);
    var gridStart = new Date(first);
    gridStart.setDate(1 - first.getDay()); // Sunday-start offset

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    daysCell.innerHTML = "";

    // 42 cells = 6 weeks, covers all month layouts.
    for (var i = 0; i < 42; i++) {
      var day = new Date(gridStart);
      day.setDate(gridStart.getDate() + i);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cal-day";
      btn.textContent = String(day.getDate());
      btn.setAttribute("role", "gridcell");
      btn.setAttribute("aria-label", ymd(day));

      if (day.getMonth() !== month) {
        btn.classList.add("other-month");
        btn.setAttribute("aria-disabled", "true");
      }

      if (day.getTime() === today.getTime()) {
        btn.classList.add("today");
      }

      if (selectedDate && day.getTime() === selectedDate.getTime()) {
        btn.classList.add("selected");
        btn.setAttribute("aria-selected", "true");
      }

      (function (dateBtn, dateObj) {
        dateBtn.addEventListener("click", function () {
          selectDate(dateObj);
        });
      })(btn, day);

      daysCell.appendChild(btn);
    }

    // Set focused date to selected, today, or first visible day.
    if (selectedDate) {
      focusedDate = new Date(selectedDate);
    } else if (dayInRange(view, today)) {
      focusedDate = new Date(today);
    } else {
      focusedDate = new Date(gridStart);
    }
    applyFocus();
  }

  function dayInRange(monthDate, check) {
    return (
      check.getFullYear() === monthDate.getFullYear() &&
      check.getMonth() === monthDate.getMonth()
    );
  }

  function applyFocus() {
    var cells = daysCell.querySelectorAll(".cal-day");
    for (var i = 0; i < cells.length; i++) {
      if (ymdFromCell(cells[i]) === ymd(focusedDate)) {
        cells[i].focus();
        return;
      }
    }
  }

  function ymdFromCell(cell) {
    return cell.getAttribute("aria-label");
  }

  function selectDate(date) {
    selectedDate = date;
    input.value = ymd(date);
    selectedOutput.textContent = ymd(date);
    renderCalendar(view);
    announce("Selected " + ymd(date));
    closeCalendar();
  }

  function announce(msg) {
    selectedOutput.textContent = msg;
  }

  function openCalendar() {
    calendar.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Calendar open");
    renderCalendar(view);
  }

  function closeCalendar() {
    calendar.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open calendar");
    trigger.focus();
  }

  function toggleCalendar() {
    if (calendar.hidden) {
      openCalendar();
    } else {
      closeCalendar();
    }
  }

  function changeMonth(delta) {
    renderCalendar(new Date(view.getFullYear(), view.getMonth() + delta, 1));
    announce(MONTHS[(view.getMonth() + delta + 12) % 12] + " " + view.getFullYear());
  }

  // Trigger button.
  trigger.addEventListener("click", function (e) {
    e.preventDefault();
    toggleCalendar();
  });

  // Input click toggles the calendar (open if closed, close if open).
  input.addEventListener("click", function () {
    toggleCalendar();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (calendar.hidden) openCalendar();
      else closeCalendar();
    }
  });

  // Prev/Next month.
  prevBtn.addEventListener("click", function () { changeMonth(-1); });
  nextBtn.addEventListener("click", function () { changeMonth(1); });

  // Today.
  todayBtn.addEventListener("click", function () {
    var t = new Date();
    view = new Date(t.getFullYear(), t.getMonth(), 1);
    renderCalendar(view);
    if (!dayInRange(view, t)) {
      // Jump to the month containing today.
      renderCalendar(t);
    }
  });

  // Close.
  closeBtn.addEventListener("click", function () { closeCalendar(); });

  // Click outside closes. Also treat a click as "inside" when focus has been
  // moved into the widget (applyFocus() focuses a day cell while opening), so
  // the click-outside check can't mistake it for an outside click.
  document.addEventListener("click", function (e) {
    var insideTarget = calendar.contains(e.target) || trigger.contains(e.target) || input.contains(e.target);
    var active = document.activeElement;
    var insideFocus = calendar.contains(active) || trigger.contains(active) || input.contains(active);
    if (!calendar.hidden && !insideTarget && !insideFocus) {
      closeCalendar();
    }
  });

  // Keyboard navigation inside the grid.
  calendar.addEventListener("keydown", function (e) {
    var key = e.key;
    var move = null;

    switch (key) {
      case "ArrowLeft":
        move = -1;
        break;
      case "ArrowRight":
        move = 1;
        break;
      case "ArrowUp":
        move = -7;
        break;
      case "ArrowDown":
        move = 7;
        break;
      case "Home":
        move = "home";
        break;
      case "End":
        move = "end";
        break;
      case "PageUp":
        move = keyWithShift(e, -30);
        break;
      case "PageDown":
        move = keyWithShift(e, 30);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedDate) selectDate(new Date(focusedDate));
        return;
      case "Escape":
        e.preventDefault();
        closeCalendar();
        return;
      case "Tab":
        closeCalendar();
        return;
      default:
        return;
    }

    e.preventDefault();

    if (move === "home") {
      var first = daysCell.querySelectorAll(".cal-day")[0];
      if (first) first.focus();
      return;
    }
    if (move === "end") {
      var last = Array.prototype.slice.call(daysCell.querySelectorAll(".cal-day")).reverse()[0];
      if (last) last.focus();
      return;
    }

    focusedDate = addDays(focusedDate || new Date(), move);
    ensureVisible(focusedDate);
    applyFocus();
  });

  function keyWithShift(e, base) {
    return e.shiftKey ? base + 7 : base;
  }

  function addDays(d, delta) {
    var nd = new Date(d);
    nd.setDate(d.getDate() + delta);
    return nd;
  }

  function ensureVisible(d) {
    if (!dayInRange(view, d)) {
      renderCalendar(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }

  // Initialize: render an empty calendar (hidden until opened).
  renderCalendar(new Date());
})();
