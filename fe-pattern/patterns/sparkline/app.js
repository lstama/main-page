/* Sparkline — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var rowsEl = document.getElementById("rows");
  if (!rowsEl) return;

  var SVG_NS = "http://www.w3.org/2000/svg";
  var W = 120, H = 40, PAD = 4;

  var DATA = [
    { label: "Revenue", sub: "Last 12 days", values: [40, 44, 42, 48, 52, 50, 58, 62, 60, 66, 70, 74], up: true },
    { label: "Signups", sub: "Last 12 days", values: [12, 15, 14, 18, 17, 22, 20, 24, 26, 25, 30, 34], up: true },
    { label: "Bounce rate", sub: "Last 12 days", values: [60, 58, 62, 57, 59, 55, 54, 52, 53, 50, 49, 48], up: false },
    { label: "Latency", sub: "Last 12 days", values: [80, 76, 82, 74, 78, 70, 68, 72, 66, 64, 60, 58], up: false },
  ];

  var tip = document.createElement("div");
  tip.className = "tooltip";
  document.body.appendChild(tip);

  function buildSpark(values, x, y, isMin, isMax) {
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var range = max - min || 1;
    var stepX = (W - PAD * 2) / (values.length - 1);

    var pts = values.map(function (v, i) {
      return {
        x: PAD + i * stepX,
        y: PAD + (1 - (v - min) / range) * (H - PAD * 2),
      };
    });

    var line = pts.map(function (p) { return p.x + "," + p.y; }).join(" ");
    var area = "M" + pts[0].x + "," + (H - PAD) +
      " L" + pts.map(function (p) { return " " + p.x + "," + p.y; }).join("") +
      " L" + pts[pts.length - 1].x + "," + (H - PAD) + " Z";

    var frag = "";
    frag += '<path class="spark-area" d="' + area + '"/>';
    frag += '<polyline class="spark-line" points="' + line + '"/>';

    // Highlight min and max points.
    pts.forEach(function (p, i) {
      if (values[i] === min || values[i] === max) {
        frag += '<circle class="spark-dot spark-dot-extreme" cx="' + p.x + '" cy="' + p.y + '" r="2.5"/>';
      }
    });

    return { svg: frag, point: pts };
  }

  DATA.forEach(function (d) {
    var row = document.createElement("div");
    row.className = "row";

    var meta = document.createElement("div");
    meta.className = "row-meta";
    meta.innerHTML = '<div class="row-label">' + d.label + '</div>' +
      '<div class="row-sub">' + d.sub + '</div>';

    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "spark");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("aria-hidden", "true");

    var built = buildSpark(d.values);
    svg.innerHTML = built.svg;
    // Attach hover tooltips to the data points.
    built.point.forEach(function (p, i) {
      var circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("cx", p.x);
      circle.setAttribute("cy", p.y);
      circle.setAttribute("r", 6);
      circle.setAttribute("fill", "transparent");
      circle.style.cursor = "default";
      (function (idx, pt) {
        circle.addEventListener("mouseenter", function () {
          tip.textContent = d.values[idx];
          tip.classList.add("visible");
        });
        circle.addEventListener("mousemove", function (e) {
          tip.style.left = (e.clientX + 10) + "px";
          tip.style.top = (e.clientY + 10) + "px";
        });
        circle.addEventListener("mouseleave", function () {
          tip.classList.remove("visible");
        });
      })(i, p);
      svg.appendChild(circle);
    });

    var value = document.createElement("div");
    value.className = "row-value " + (d.up ? "up" : "down");
    value.textContent = (d.up ? "↑ " : "↓ ") + d.values[d.values.length - 1];

    row.appendChild(meta);
    row.appendChild(svg);
    row.appendChild(value);
    rowsEl.appendChild(row);
  });
})();
