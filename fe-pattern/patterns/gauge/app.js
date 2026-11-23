/* Gauge — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var slider = document.getElementById("slider");
  var valEl = document.getElementById("slider-val");
  var valueEl = document.getElementById("value");
  var fill = document.getElementById("gauge-fill");
  var needle = document.getElementById("needle");
  if (!slider) return;

  var ARC = 251.3; // π * r (r = 80)

  function lerp(a, b, t) { return a + (b - a) * t; }

  function colorFor(v) {
    // green (120) -> yellow (60) -> red (0) as v goes 0..100.
    var hue = 120 - (v / 100) * 120;
    return "hsl(" + hue + ", 70%, 45%)";
  }

  function render(v) {
    var frac = v / 100;
    fill.style.strokeDashoffset = ARC * (1 - frac);
    fill.style.stroke = colorFor(v);
    // Needle: -90deg at 0, +90deg at 100.
    needle.style.transform = "rotate(" + (-90 + v * 1.8) + "deg)";
    if (valueEl) valueEl.textContent = Math.round(v);
    if (valEl) valEl.textContent = Math.round(v);
  }

  slider.addEventListener("input", function () {
    render(parseInt(slider.value, 10));
  });

  render(0);
})();
