/* Masonry — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var masonry = document.getElementById("masonry");
  if (!masonry) return;

  // Demo data: each tile has a random-ish height so the columns balance.
  var DATA = [
    { title: "Short", body: "A brief note.", h: 0.4 },
    { title: "Tall story", body: "Here is a longer write-up with several paragraphs of detail about the topic at hand and why it matters.", h: 1.0 },
    { title: "Medium", body: "A moderate-length caption.", h: 0.7 },
    { title: "Image only", body: "", h: 1.3 },
    { title: "Quote", body: "\"Design is intelligence made visible.\" — Alina Wheeler", h: 0.5 },
    { title: "Gallery", body: "A photo grid lives here.", h: 0.9 },
    { title: "Link", body: "Just a headline and a link.", h: 0.45 },
    { title: "Full note", body: "This tile carries a full-length note so the masonry has something to balance across the columns as content varies in height.", h: 1.2 },
  ];

  DATA.forEach(function (d, i) {
    var tile = document.createElement("article");
    tile.className = "tile";

    var thumb = document.createElement("div");
    thumb.className = "tile-thumb";
    thumb.style.height = (60 * d.h) + "px";

    var body = document.createElement("div");
    body.className = "tile-body";
    var h = document.createElement("h3");
    h.textContent = d.title;
    body.appendChild(h);
    if (d.body) {
      var p = document.createElement("p");
      p.textContent = d.body;
      body.appendChild(p);
    }

    tile.appendChild(thumb);
    tile.appendChild(body);
    masonry.appendChild(tile);
  });
})();
