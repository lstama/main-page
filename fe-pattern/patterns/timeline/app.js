/* Timeline — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var timeline = document.querySelector(".timeline");
  if (!timeline) return;

  var events = Array.prototype.slice.call(timeline.querySelectorAll(".event"));

  // Optional filter input (progressive enhancement). If present, filter events by
  // title/date/description text. Works with keyboard and touch.
  var filter = document.getElementById("timeline-filter");
  if (filter) {
    filter.addEventListener("input", function () {
      var term = filter.value.trim().toLowerCase();
      var visible = 0;
      events.forEach(function (event) {
        var text = event.textContent.toLowerCase();
        var match = term === "" || text.indexOf(term) !== -1;
        event.hidden = !match;
        if (match) visible++;
      });
      announce(visible + " of " + events.length + " events shown");
    });
  }

  // Clicking an event marks it selected and announces the selection.
  events.forEach(function (event) {
    event.setAttribute("tabindex", "0");
    event.addEventListener("click", function () {
      events.forEach(function (other) {
        other.classList.remove("selected");
      });
      event.classList.add("selected");
      var title = event.querySelector(".event-title").textContent;
      var date = event.querySelector(".event-date").textContent;
      announce("Selected: " + title + ", " + date);
    });
    // Keyboard: Enter or Space toggles selection.
    event.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        event.click();
      }
    });
  });

  function announce(msg) {
    var status = document.getElementById("status");
    if (!status) {
      var region = document.createElement("p");
      region.id = "status";
      region.role = "status";
      region.setAttribute("aria-live", "polite");
      region.style.marginTop = "1rem";
      region.style.fontWeight = "600";
      region.style.color = "var(--accent)";
      region.textContent = "";
      var main = document.getElementById("main");
      if (main) main.appendChild(region);
      status = region;
    }
    status.textContent = msg;
  }
})();
