/* Custom Checkbox — progressive enhancement. Pure JS, no framework.

   Enhancement: wires up the "All features" parent checkbox to control the child
   checkboxes and to show an indeterminate state when only some are selected.
   The controls work without JS — this just adds the group behavior. */
(function () {
  "use strict";

  var parent = document.querySelector(".check-parent");
  if (!parent) return;

  var children = Array.prototype.slice.call(
    document.querySelectorAll(".check-child")
  );

  var syncing = false;

  // User toggles the parent -> propagate to every child.
  parent.addEventListener("change", function () {
    if (syncing) return;
    syncing = true;
    children.forEach(function (child) {
      child.checked = parent.checked;
    });
    syncing = false;
  });

  // User toggles a child -> recompute the parent's checked/indeterminate state.
  children.forEach(function (child) {
    child.addEventListener("change", function () {
      if (syncing) return;
      syncing = true;
      var checkedCount = children.filter(function (c) { return c.checked; }).length;
      parent.checked = checkedCount === children.length && children.length > 0;
      parent.indeterminate = checkedCount > 0 && checkedCount < children.length;
      parent.classList.toggle("indeterminate", parent.indeterminate);
      syncing = false;
    });
  });

  // Reflect the initial HTML state (e.g. a checked child) on load.
  (function initial() {
    var checkedCount = children.filter(function (c) { return c.checked; }).length;
    parent.checked = checkedCount === children.length && children.length > 0;
    parent.indeterminate = checkedCount > 0 && checkedCount < children.length;
    parent.classList.toggle("indeterminate", parent.indeterminate);
  })();
})();
