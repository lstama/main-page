/* JSON Formatter — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var input = document.getElementById("input");
  var output = document.getElementById("output");
  var status = document.getElementById("status");
  var formatBtn = document.getElementById("format");
  var compactBtn = document.getElementById("compact");
  var validateBtn = document.getElementById("validate");
  var clearBtn = document.getElementById("clear");
  if (!input) return;

  function parse() {
    try {
      return { value: JSON.parse(input.value), error: null };
    } catch (e) {
      return { value: null, error: e };
    }
  }

  function setStatus(msg, kind) {
    status.textContent = msg;
    status.className = "status " + (kind || "");
  }

  function doFormat() {
    var r = parse();
    if (r.error) {
      output.textContent = "";
      setStatus("Invalid JSON", "bad");
      return;
    }
    output.textContent = JSON.stringify(r.value, null, 2);
    setStatus("Valid JSON — formatted", "ok");
  }

  function doCompact() {
    var r = parse();
    if (r.error) {
      output.textContent = "";
      setStatus("Invalid JSON", "bad");
      return;
    }
    output.textContent = JSON.stringify(r.value);
    setStatus("Valid JSON — compacted", "ok");
  }

  function doValidate() {
    var r = parse();
    if (r.error) {
      // Extract line/column from the message when present.
      var msg = r.error.message;
      var m = /line (\d+) col (\d+)/.exec(msg);
      if (m) {
        setStatus("Invalid JSON — line " + m[1] + ", column " + m[2], "bad");
      } else {
        setStatus("Invalid JSON: " + msg, "bad");
      }
      return;
    }
    setStatus("Valid JSON — " + Object.keys(r.value).length + " top-level keys", "ok");
  }

  function doClear() {
    input.value = "";
    output.textContent = "";
    setStatus("", "");
    input.focus();
  }

  // Live-validate as the user types (debounced).
  var timer = null;
  input.addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(doValidate, 300);
  });

  formatBtn.addEventListener("click", doFormat);
  compactBtn.addEventListener("click", doCompact);
  validateBtn.addEventListener("click", doValidate);
  clearBtn.addEventListener("click", doClear);
})();
