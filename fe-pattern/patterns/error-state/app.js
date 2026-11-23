/* Error State — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var error = document.getElementById("error");
  var ok = document.getElementById("ok");
  var retryBtn = document.getElementById("retry");
  var dismissBtn = document.getElementById("dismiss");
  if (!error) return;

  var busy = false;

  function showError() {
    ok.hidden = true;
    error.hidden = false;
  }

  function showOk() {
    error.hidden = true;
    ok.hidden = false;
  }

  function simulateRequest() {
    if (busy) return;
    busy = true;
    retryBtn.classList.add("loading");
    retryBtn.textContent = "Loading…";
    retryBtn.disabled = true;

    setTimeout(function () {
      retryBtn.classList.remove("loading");
      retryBtn.textContent = "Retry";
      retryBtn.disabled = false;
      busy = false;
      showOk();
    }, 1200);
  }

  retryBtn.addEventListener("click", simulateRequest);

  dismissBtn.addEventListener("click", function () {
    // Dismiss just re-shows the error as if the panel can be cycled.
    showError();
  });

  showError();
})();
