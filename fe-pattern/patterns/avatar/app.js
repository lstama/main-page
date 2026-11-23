/* Avatar — progressive enhancement. Pure JS, no framework.

   Enhancement: if an <img> avatar fails to load, swap in the initials
   fallback (derived from the accessible label) so the avatar never breaks. */
(function () {
  "use strict";

  var avatars = Array.prototype.slice.call(document.querySelectorAll(".avatar"));
  if (!avatars.length) return;

  avatars.forEach(function (avatar) {
    var img = avatar.querySelector("img");
    if (!img) return;

    // Build initials from the accessible label.
    var label = (avatar.getAttribute("aria-label") || "").trim();
    var initials = label
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); })
      .join("");

    img.addEventListener("error", function () {
      img.remove();
      var span = document.createElement("span");
      span.className = "initials";
      span.textContent = initials || "?";
      avatar.appendChild(span);
    });
  });
})();
