/* Stopwatch — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var timeEl = document.getElementById("time");
  var toggleBtn = document.getElementById("toggle");
  var lapBtn = document.getElementById("lap");
  var resetBtn = document.getElementById("reset");
  var lapList = document.getElementById("lap-list");
  if (!timeEl) return;

  var running = false;
  var startTs = 0;
  var elapsed = 0;
  var rafId = null;
  var laps = []; // { total, split }

  function fmt(ms) {
    var m = Math.floor(ms / 60000);
    var s = Math.floor((ms % 60000) / 1000);
    var cs = Math.floor(ms % 1000);
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    var p3 = function (n) { return (n < 10 ? "00" : (n < 100 ? "0" : "")) + n; };
    return p(m) + ":" + p(s) + "." + p3(cs);
  }

  function tick() {
    if (!running) return;
    elapsed = Date.now() - startTs;
    timeEl.textContent = fmt(elapsed);
    rafId = requestAnimationFrame(tick);
  }

  function setButtons() {
    toggleBtn.textContent = running ? "Stop" : "Start";
    toggleBtn.classList.toggle("primary", !running);
    lapBtn.disabled = !running;
    resetBtn.disabled = !running;
  }

  function start() {
    running = true;
    startTs = Date.now() - elapsed;
    rafId = requestAnimationFrame(tick);
    setButtons();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
    setButtons();
  }

  function recordLap() {
    var total = elapsed;
    var prevTotal = laps.length ? laps[laps.length - 1].total : 0;
    var split = total - prevTotal;
    laps.push({ total: total, split: split });
    renderLaps();
  }

  function renderLaps() {
    lapList.innerHTML = "";
    if (!laps.length) return;

    // Find best/worst splits (only among recorded laps).
    var best = Infinity, worst = -Infinity;
    laps.forEach(function (l) {
      if (l.split < best) best = l.split;
      if (l.split > worst) worst = l.split;
    });

    // Reverse so newest lap on top.
    for (var i = laps.length - 1; i >= 0; i--) {
      var l = laps[i];
      var row = document.createElement("li");
      row.className = "lap";
      if (l.split === best) row.classList.add("best");
      if (l.split === worst) row.classList.add("worst");

      var name = document.createElement("span");
      name.className = "lap-name";
      name.textContent = "Lap " + (laps.length - i);

      var diff = document.createElement("span");
      diff.className = "lap-diff";
      diff.textContent = "+" + fmt(l.split);

      var t = document.createElement("span");
      t.className = "lap-time";
      t.textContent = fmt(l.total);

      row.appendChild(name);
      row.appendChild(t);
      row.appendChild(diff);
      lapList.appendChild(row);
    }
  }

  function reset() {
    stop();
    elapsed = 0;
    laps = [];
    timeEl.textContent = "00:00.000";
    renderLaps();
    setButtons();
  }

  toggleBtn.addEventListener("click", function () {
    if (running) stop();
    else start();
  });
  lapBtn.addEventListener("click", recordLap);
  resetBtn.addEventListener("click", reset);
})();
