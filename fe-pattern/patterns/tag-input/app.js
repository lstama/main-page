/* Tag Input — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var input = document.getElementById("tag-input");
  var hidden = document.getElementById("tag-value");
  var tagsEl = document.getElementById("tags");
  var valueEl = document.getElementById("value");
  if (!input) return;

  var tags = [];

  function render() {
    tagsEl.innerHTML = "";
    tags.forEach(function (text, i) {
      var li = document.createElement("li");
      li.className = "tag";

      var span = document.createElement("span");
      span.textContent = text;

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "tag-remove";
      remove.setAttribute("aria-label", "Remove " + text);
      remove.textContent = "×";
      remove.addEventListener("click", function () {
        removeTag(i);
      });

      li.appendChild(span);
      li.appendChild(remove);
      tagsEl.appendChild(li);
    });

    // Sync hidden field + displayed value.
    hidden.value = JSON.stringify(tags);
    if (valueEl) valueEl.textContent = JSON.stringify(tags);
  }

  function addTag(raw) {
    var text = raw.replace(/[,;]+/g, " ").trim();
    if (!text) return;
    if (tags.indexOf(text) !== -1) return; // no duplicates
    tags.push(text);
    render();
  }

  function removeTag(index) {
    tags.splice(index, 1);
    render();
  }

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === "," || e.key === ";") {
      e.preventDefault();
      addTag(input.value);
      input.value = "";
    } else if (e.key === "Backspace" && input.value === "" && tags.length) {
      // Remove the last tag when the field is empty.
      e.preventDefault();
      removeTag(tags.length - 1);
    }
  });

  input.addEventListener("input", function () {
    // Keep the caret at the end while typing.
    requestAnimationFrame(function () {
      input.setSelectionRange(input.value.length, input.value.length);
    });
  });

  render();
})();
