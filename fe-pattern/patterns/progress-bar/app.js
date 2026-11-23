/* Progress Bar — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var track = document.querySelector('.track[aria-label="Upload progress"]');
  var fill = document.getElementById("fill");
  var range = document.getElementById("range");
  var pct = document.getElementById("pct");
  var startBtn = document.getElementById("start");
  var resetBtn = document.getElementById("reset");
  if (!track) return;

  var value = 0;
  var timer = null;

  function setProgress(v) {
    value = Math.max(0, Math.min(100, v));
    fill.style.width = value + "%";
    track.setAttribute("aria-valuenow", Math.round(value));
    if (pct) pct.textContent = Math.round(value) + "%";
  }

  function start() {
    if (timer) return;
    if (value >= 100) value = 0;
    timer = setInterval(function () {
      // Random-ish increments that slow near the end.
      var step = Math.random() * 4 + 1;
      if (value > 90) step *= 0.4;
      setProgress(value + step);
      if (value >= 100) {
        clearInterval(timer);
        timer = null;
      }
    }, 150);
  }

  function reset() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    setProgress(0);
    if (range) range.value = "0";
  }

  // Determinate is driven by the range slider.
  range.addEventListener("input", function () {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    setProgress(parseInt(range.value, 10));
  });

  startBtn.addEventListener("click", start);
  resetBtn.addEventListener("click", reset);

  setProgress(0);
})();
