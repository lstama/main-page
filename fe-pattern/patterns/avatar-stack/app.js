/* Avatar Stack — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var container = document.getElementById("avatars");
  var more = document.getElementById("more");
  if (!container || !more) return;

  var MAX_VISIBLE = 5; // show first N, rest collapse into "+N"

  var avatars = Array.prototype.slice.call(container.querySelectorAll(".avatar"));
  var total = avatars.length;

  if (total <= MAX_VISIBLE) {
    more.textContent = "";
    return;
  }

  avatars.forEach(function (el, i) {
    el.style.display = i < MAX_VISIBLE ? "" : "none";
  });

  more.textContent = "+" + (total - MAX_VISIBLE);
})();
