/* Unit Converter — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var cats = Array.prototype.slice.call(document.querySelectorAll(".cat"));
  var fromValue = document.getElementById("from-value");
  var toValue = document.getElementById("to-value");
  var fromUnit = document.getElementById("from-unit");
  var toUnit = document.getElementById("to-unit");
  if (!fromValue) return;

  var UNITS = {
    length: {
      m: 1, km: 1000, cm: 0.01, mm: 0.001,
      mi: 1609.344, ft: 0.3048, in: 0.0254, yd: 0.9144,
    },
    weight: {
      g: 1, kg: 1000, mg: 0.001, lb: 453.592, oz: 28.3495, t: 1000000,
    },
  };

  var currentCat = "length";

  function populate() {
    var keys = Object.keys(UNITS[currentCat]);
    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";
    keys.forEach(function (k, i) {
      var o1 = document.createElement("option");
      o1.value = k; o1.textContent = k;
      fromUnit.appendChild(o1);
      var o2 = document.createElement("option");
      o2.value = k; o2.textContent = k;
      toUnit.appendChild(o2);
    });
    fromUnit.selectedIndex = 0;
    toUnit.selectedIndex = keys.length > 1 ? 1 : 0;
  }

  function convert() {
    var v = parseFloat(fromValue.value);
    if (fromValue.value === "" || isNaN(v)) {
      toValue.value = "";
      return;
    }
    var result;
    if (currentCat === "temperature") {
      result = convertTemp(v, fromUnit.value, toUnit.value);
    } else {
      var factor = UNITS[currentCat];
      var base = v * factor[fromUnit.value]; // to base unit
      result = base / factor[toUnit.value];
    }
    toValue.value = round(result);
  }

  function convertTemp(v, from, to) {
    var c;
    if (from === "C") c = v;
    else if (from === "F") c = (v - 32) * 5 / 9;
    else c = v - 273.15; // K
    if (to === "C") return c;
    if (to === "F") return c * 9 / 5 + 32;
    return c + 273.15; // K
  }

  function round(n) {
    return Math.round(n * 1e6) / 1e6;
  }

  cats.forEach(function (cat) {
    cat.addEventListener("click", function () {
      cats.forEach(function (c) { c.classList.remove("active"); });
      cat.classList.add("active");
      currentCat = cat.getAttribute("data-cat");
      populate();
      convert();
    });
  });

  fromValue.addEventListener("input", convert);
  fromUnit.addEventListener("change", convert);
  toUnit.addEventListener("change", convert);

  populate();
  convert();
})();
