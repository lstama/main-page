/* Filter Panel — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var grid = document.getElementById("grid");
  var empty = document.getElementById("empty");
  var count = document.getElementById("result-count");
  var resetBtn = document.getElementById("reset");
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  if (!grid) return;

  var DATA = [
    { title: "Design System", cat: "design" },
    { title: "Icon Set", cat: "design" },
    { title: "Style Guide", cat: "design" },
    { title: "API Client", cat: "dev" },
    { title: "Auth Flow", cat: "dev" },
    { title: "CLI Tool", cat: "dev" },
    { title: "SEO Audit", cat: "marketing" },
    { title: "Campaign", cat: "marketing" },
    { title: "Landing Page", cat: "sales" },
    { title: "Price List", cat: "sales" },
  ];

  function render() {
    var selected = filters.filter(function (f) { return f.checked; })
      .map(function (f) { return f.getAttribute("data-cat"); });

    grid.innerHTML = "";
    var shown = 0;

    DATA.forEach(function (item) {
      if (selected.indexOf(item.cat) === -1) return;
      var card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        '<h3 class="card-title">' + item.title + '</h3>' +
        '<span class="card-cat">' + item.cat + '</span>';
      grid.appendChild(card);
      shown++;
    });

    count.textContent = "Showing " + shown + " item" + (shown === 1 ? "" : "s");
    empty.hidden = shown !== 0;
  }

  filters.forEach(function (f) {
    f.addEventListener("change", render);
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      filters.forEach(function (f) { f.checked = true; });
      render();
    });
  }

  render();
})();
