/* Empty State — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var empty = document.getElementById("empty");
  var list = document.getElementById("list");
  var toggleBtn = document.getElementById("toggle");
  var cta = document.getElementById("cta");
  if (!empty) return;

  var shown = false;

  function showList() {
    shown = true;
    empty.hidden = true;
    list.hidden = false;
  }

  function showEmpty() {
    shown = false;
    empty.hidden = false;
    list.hidden = true;
  }

  toggleBtn.addEventListener("click", function () {
    if (shown) showEmpty();
    else showList();
  });

  // The CTA in the empty state "adds" a task.
  cta.addEventListener("click", showList);
})();
