/* Countdown — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var hEl = document.getElementById("h");
  var mEl = document.getElementById("m");
  var sEl = document.getElementById("s");
  var inH = document.getElementById("in-h");
  var inM = document.getElementById("in-m");
  var inS = document.getElementById("in-s");
  var startBtn = document.getElementById("start");
  var pauseBtn = document.getElementById("pause");
  var resetBtn = document.getElementById("reset");
  var status = document.getElementById("status");
  if (!hEl) return;

  var endTs = 0;
  var intervalId = null;
  var totalMs = 0;

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function clampInput(el) {
    var v = parseInt(el.value, 10);
    if (isNaN(v) || v < 0) el.value = 0;
  }

  function readInputs() {
    clampInput(inH);
    clampInput(inM);
    clampInput(inS);
    return (parseInt(inH.value, 10) || 0) * 3600000 +
           (parseInt(inM.value, 10) || 0) * 60000 +
           (parseInt(inS.value, 10) || 0) * 1000;
  }

  function setInputsFromMs(ms) {
    var totalSec = Math.max(0, Math.ceil(ms / 1000));
    var hh = Math.floor(totalSec / 3600);
    var mm = Math.floor((totalSec % 3600) / 60);
    var ss = totalSec % 60;
    inH.value = hh;
    inM.value = mm;
    inS.value = ss;
  }

  function render(remaining) {
    var totalSec = Math.max(0, Math.ceil(remaining / 1000));
    var hh = Math.floor(totalSec / 3600);
    var mm = Math.floor((totalSec % 3600) / 60);
    var ss = totalSec % 60;
    hEl.textContent = pad(hh);
    mEl.textContent = pad(mm);
    sEl.textContent = pad(ss);
  }

  function complete() {
    clearInterval(intervalId);
    intervalId = null;
    setButtons();
    status.textContent = "Time's up!";
    status.classList.add("done");
    // Dispatch a custom event so host apps can react.
    document.dispatchEvent(new CustomEvent("countdown:complete", { detail: { totalMs: totalMs } }));
  }

  function tick() {
    var remaining = endTs - Date.now();
    if (remaining <= 0) {
      render(0);
      complete();
      return;
    }
    render(remaining);
  }

  function start() {
    if (endTs === 0) {
      totalMs = readInputs();
      if (totalMs <= 0) {
        status.textContent = "Set a duration greater than zero.";
        return;
      }
      endTs = Date.now() + totalMs;
    }
    intervalId = setInterval(tick, 250);
    setButtons();
    status.textContent = "";
    status.classList.remove("done");
  }

  function pause() {
    clearInterval(intervalId);
    intervalId = null;
    endTs = 0;
    setButtons();
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    endTs = 0;
    var remaining = totalMs || readInputs();
    setInputsFromMs(remaining);
    render(remaining);
    setButtons();
    status.textContent = "";
    status.classList.remove("done");
  }

  function setButtons() {
    var running = intervalId !== null;
    startBtn.disabled = running;
    pauseBtn.disabled = !running;
    resetBtn.disabled = !running;
    var locked = running || endTs !== 0;
    inH.disabled = inM.disabled = inS.disabled = locked;
  }

  startBtn.addEventListener("click", start);
  pauseBtn.addEventListener("click", pause);
  resetBtn.addEventListener("click", reset);

  // Keep the clock in sync with live input edits while stopped.
  [inH, inM, inS].forEach(function (el) {
    el.addEventListener("input", function () {
      if (!intervalId && endTs === 0) {
        render(readInputs());
      }
    });
  });

  // Seed the display from the inputs.
  render(readInputs());
  setButtons();
})();
