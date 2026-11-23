/* Custom Radio — progressive enhancement. Pure JS, no framework.

   Enhancement: shows the currently selected plan below the group. Radio groups
   already enforce single-select without JS; this just surfaces the choice. */
(function () {
  "use strict";

  var group = document.querySelector(".radio-group");
  if (!group) return;

  var radios = Array.prototype.slice.call(
    group.querySelectorAll(".radio-input")
  );
  var output = document.getElementById("radio-output");

  function announce() {
    var checked = group.querySelector(".radio-input:checked");
    var value = checked ? checked.value : "none";
    if (output) {
      output.textContent = "Selected plan: " + value;
    }
  }

  radios.forEach(function (radio) {
    radio.addEventListener("change", announce);
  });

  // Initial state.
  if (window.addEventListener && document.addEventListener) {
    document.addEventListener("DOMContentLoaded", announce);
    announce();
  }
})();
