/* Pomodoro Timer — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var DURATIONS = { work: 25 * 60 * 1000, short: 5 * 60 * 1000, long: 15 * 60 * 1000 };
  var LONG_EVERY = 4;

  var timeEl = document.getElementById("time");
  var ring = document.getElementById("ring");
  var toggleBtn = document.getElementById("toggle");
  var resetBtn = document.getElementById("reset");
  var skipBtn = document.getElementById("skip");
  var countEl = document.getElementById("count");
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".tab"));
  if (!timeEl) return;

  var CIRCUMFERENCE = 2 * Math.PI * 52;
  ring.style.strokeDasharray = CIRCUMFERENCE + "px";

  var mode = "work";
  var running = false;
  var remaining = DURATIONS[mode];
  var endTs = 0;
  var intervalId = null;
  var pomodoros = 0;

  function fmt(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function paint() {
    timeEl.textContent = fmt(remaining);
    var frac = remaining / DURATIONS[mode];
    ring.style.strokeDashoffset = CIRCUMFERENCE * frac;
  }

  function setMode(m, updateRemaining) {
    mode = m;
    var dur = DURATIONS[mode];
    if (updateRemaining) remaining = dur;
    paint();
    tabs.forEach(function (t) {
      t.classList.toggle("active", t.getAttribute("data-mode") === mode);
    });
    // Accent the controls + ring to the session color.
    var color = getComputedStyle(document.documentElement).getPropertyValue(
      "--" + (mode === "work" ? "work" : mode === "short" ? "short" : "long")
    ).trim();
    toggleBtn.style.background = color;
    toggleBtn.style.color = "#fff";
    toggleBtn.style.borderColor = color;
    ring.style.stroke = color;
  }

  function tick() {
    remaining = endTs - Date.now();
    if (remaining <= 0) {
      complete();
      return;
    }
    paint();
  }

  function beep() {
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      var ctx = new AC();
      var t = ctx.currentTime;
      [0, 0.18, 0.36].forEach(function (d) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + d);
        gain.gain.setValueAtTime(0.0001, t + d);
        gain.gain.exponentialRampToValueAtTime(0.3, t + d + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
        osc.stop(t + d + 0.18);
      });
    } catch (e) {
      /* audio unavailable */
    }
  }

  function complete() {
    clearInterval(intervalId);
    intervalId = null;
    running = false;
    beep();
    if (mode === "work") {
      pomodoros += 1;
      countEl.textContent = pomodoros;
      // After a long cycle, suggest a long break.
      if (pomodoros % LONG_EVERY === 0) {
        setMode("long", true);
      } else {
        setMode("short", true);
      }
    } else {
      setMode("work", true);
    }
    setButtons();
  }

  function start() {
    running = true;
    endTs = Date.now() + remaining;
    intervalId = setInterval(tick, 250);
    setButtons();
  }

  function pause() {
    clearInterval(intervalId);
    intervalId = null;
    running = false;
    setButtons();
  }

  function reset() {
    clearInterval(intervalId);
    intervalId = null;
    running = false;
    remaining = DURATIONS[mode];
    pomodoros = 0;
    countEl.textContent = "0";
    paint();
    setButtons();
  }

  function skip() {
    remaining = 0;
    complete();
  }

  function setButtons() {
    toggleBtn.textContent = running ? "Pause" : "Start";
  }

  toggleBtn.addEventListener("click", function () {
    if (running) pause();
    else start();
  });
  resetBtn.addEventListener("click", reset);
  skipBtn.addEventListener("click", skip);
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (running) pause();
      setMode(tab.getAttribute("data-mode"), true);
      setButtons();
    });
  });

  setMode("work", true);
  setButtons();
})();
