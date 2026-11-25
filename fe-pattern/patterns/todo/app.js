/* Todo List — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var form = document.getElementById("form");
  var input = document.getElementById("input");
  var list = document.getElementById("list");
  var count = document.getElementById("count");
  var clearBtn = document.getElementById("clear");
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  if (!list) return;

  var STORAGE_KEY = "fe-pattern-todo";
  var tasks = [];
  var currentFilter = "all";

  function load() {
    try {
      tasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      tasks = [];
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function add(text) {
    tasks.push({ id: Date.now() + "-" + Math.random(), text: text, done: false });
    save();
    render();
  }

  function toggle(id) {
    tasks.forEach(function (t) {
      if (t.id === id) t.done = !t.done;
    });
    save();
    render();
  }

  function remove(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    save();
    render();
  }

  function clearDone() {
    tasks = tasks.filter(function (t) { return !t.done; });
    save();
    render();
  }

  function visible() {
    if (currentFilter === "active") return tasks.filter(function (t) { return !t.done; });
    if (currentFilter === "done") return tasks.filter(function (t) { return t.done; });
    return tasks;
  }

  function render() {
    list.innerHTML = "";
    var left = tasks.filter(function (t) { return !t.done; }).length;
    count.textContent = left + (left === 1 ? " item left" : " items left");

    visible().forEach(function (t) {
      var li = document.createElement("li");
      li.className = "item" + (t.done ? " done" : "");
      li.setAttribute("role", "listitem");

      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.className = "item-checkbox";
      cb.checked = t.done;
      cb.setAttribute("aria-label", "Mark " + t.text + (t.done ? " as active" : " as done"));
      cb.addEventListener("change", function () { toggle(t.id); });

      var span = document.createElement("span");
      span.className = "item-text";
      span.textContent = t.text;

      var del = document.createElement("button");
      del.type = "button";
      del.className = "item-delete";
      del.textContent = "×";
      del.setAttribute("aria-label", "Delete " + t.text);
      del.addEventListener("click", function () { remove(t.id); });

      li.appendChild(cb);
      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  function addFromInput() {
    var text = input.value.trim();
    if (!text) return;
    add(text);
    input.value = "";
    input.focus();
  }

  // The gallery embeds this demo in a sandbox without `allow-forms`, so
  // Chromium never dispatches `submit` there. Wire the button and Enter key
  // directly; keep `submit` as a fallback for standalone use. Clearing the
  // input makes a second invocation a no-op, so no item is added twice.
  var addBtn = form.querySelector(".add-btn");
  if (addBtn) addBtn.addEventListener("click", addFromInput);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addFromInput();
    }
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    addFromInput();
  });

  clearBtn.addEventListener("click", clearDone);

  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentFilter = btn.getAttribute("data-filter");
      filters.forEach(function (b) { b.classList.toggle("active", b === btn); });
      render();
    });
  });

  load();
  render();
})();
