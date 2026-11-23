/* Toggle Group — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var groups = Array.prototype.slice.call(document.querySelectorAll(".group"));
  if (!groups.length) return;

  groups.forEach(function (group) {
    var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    if (!radios.length) return;

    function select(index) {
      radios.forEach(function (r, i) {
        r.setAttribute("aria-checked", i === index ? "true" : "false");
        if (i === index) r.focus();
      });
    }

    function move(dir) {
      var current = radios.indexOf(document.activeElement);
      if (current === -1) current = 0;
      var next = (current + dir + radios.length) % radios.length;
      select(next);
    }

    group.addEventListener("click", function (e) {
      var btn = e.target.closest('[role="radio"]');
      if (!btn) return;
      select(radios.indexOf(btn));
    });

    group.addEventListener("keydown", function (e) {
      var current = radios.indexOf(document.activeElement);
      if (current === -1) return;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowDown":
          e.preventDefault();
          move(1);
          break;
        case "ArrowLeft":
        case "ArrowUp":
          e.preventDefault();
          move(-1);
          break;
        case "Home":
          e.preventDefault();
          select(0);
          break;
        case "End":
          e.preventDefault();
          select(radios.length - 1);
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          select(current);
          break;
        default:
          // Type-ahead: jump to a radio whose label starts with the key.
          var key = e.key.toLowerCase();
          if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            var idx = radios.findIndex(function (r) {
              return r.textContent.trim().toLowerCase().indexOf(key) === 0;
            });
            if (idx !== -1) select(idx);
          }
          break;
      }
    });
  });
})();
