/* Range Slider — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var slider = document.getElementById("slider");
  var sliderOutput = document.getElementById("slider-output");
  var stepSlider = document.getElementById("step-slider");
  var stepOutput = document.getElementById("step-output");
  var rangeValue = document.getElementById("range-value");

  if (!slider) return;

  function updateRange() {
    sliderOutput.textContent = slider.value;
    stepOutput.textContent = stepSlider ? stepSlider.value : "0";
    if (rangeValue) {
      rangeValue.textContent =
        "Slider 1: " + slider.value + " · Slider 2: " + (stepSlider ? stepSlider.value : "0");
    }
  }

  slider.addEventListener("input", updateRange);
  if (stepSlider) stepSlider.addEventListener("input", updateRange);

  // Initialize.
  updateRange();
})();
