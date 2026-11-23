/* Spinner — progressive enhancement. Pure JS, no framework.

   Enhancement: the button toggles an inline spinner and sets aria-busy on the
   host region so assistive tech announces the loading state. */
(function () {
  "use strict";

  var toggleBtn = document.getElementById("toggle");
  var inline = document.getElementById("inline");
  if (!toggleBtn || !inline) return;

  var loading = false;

  function setLoading(state) {
    loading = state;
    if (state) {
      inline.hidden = false;
      toggleBtn.disabled = true;
      toggleBtn.setAttribute("aria-busy", "true");
    } else {
      inline.hidden = true;
      toggleBtn.disabled = false;
      toggleBtn.removeAttribute("aria-busy");
    }
  }

  toggleBtn.addEventListener("click", function () {
    setLoading(!loading);
    toggleBtn.textContent = loading ? "Loading…" : "Start loading";
  });
})();
