/* Chip — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var row = document.getElementById("chip-row");
  var undoBtn = document.getElementById("undo");
  if (!row) return;

  var dismissed = [];

  function collect() {
    return Array.prototype.slice.call(row.querySelectorAll(".chip"));
  }

  function dismiss(chip) {
    chip.classList.add("chip-dismissing");
    // Remove after the animation finishes. Reveal Undo only in the same frame
    // as the removal: showing it while the fading chip still occupies space
    // makes the flex-wrap .box momentarily grow an extra line.
    setTimeout(function () {
      chip.remove();
      undoBtn.hidden = false;
    }, 150);
    dismissed.push(chip);
  }

  function undo() {
    if (!dismissed.length) return;
    var chip = dismissed.pop();
    row.appendChild(chip);
    // Force reflow so the reappear can animate if desired.
    chip.classList.remove("chip-dismissing");
    if (!dismissed.length) undoBtn.hidden = true;
  }

  // Wire up each remove button.
  function wire() {
    collect().forEach(function (chip) {
      var x = chip.querySelector(".chip-x");
      if (!x) return;
      function remove(e) {
        e.preventDefault();
        if (e.type === "keydown" && e.key !== "Enter" && e.key !== " ") return;
        dismiss(chip);
      }
      x.removeEventListener("click", remove);
      x.removeEventListener("keydown", remove);
      x.addEventListener("click", remove);
      x.addEventListener("keydown", remove);
    });
  }

  if (undoBtn) undoBtn.addEventListener("click", undo);

  wire();
})();
