/* Markdown Editor — progressive enhancement. Pure JS, no framework. */
(function () {
  "use strict";

  var editor = document.getElementById("editor");
  var preview = document.getElementById("preview");
  if (!editor || !preview) return;

  var SAMPLE = [
    "# Markdown Editor",
    "",
    "A tiny **dependency-free** renderer. Supports:",
    "",
    "- Headings and lists",
    "- `inline code` and > blockquotes",
    "- [Links](https://example.com) and images",
    "",
    "```js",
    "console.log('hello');",
    "```",
    "",
    "Type on the left, preview updates live.",
  ].join("\n");

  editor.value = SAMPLE;

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function inline(s) {
    s = escapeHtml(s);
    // Inline code first so its contents aren't parsed.
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
    s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
    return s;
  }

  function render(src) {
    var lines = src.split("\n");
    var out = [];
    var inCode = false;
    var codeBuf = [];
    var inList = false;

    function closeList() {
      if (inList) { out.push("</ul>"); inList = false; }
    }

    lines.forEach(function (line) {
      // Fenced code block.
      var fence = /^(```)(.*)$/.exec(line);
      if (fence) {
        inCode = !inCode;
        if (inCode) { closeList(); codeBuf = []; }
        else {
          out.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
          codeBuf = [];
        }
        return;
      }
      if (inCode) { codeBuf.push(line); return; }

      closeList();

      // Heading.
      var h = /^(#{1,6})\s+(.*)$/.exec(line);
      if (h) {
        var level = h[1].length;
        out.push("<h" + level + ">" + inline(h[2]) + "</h" + level + ">");
        return;
      }

      // Horizontal rule.
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
        out.push("<hr />");
        return;
      }

      // Blockquote.
      var bq = /^>\s?(.*)$/.exec(line);
      if (bq) {
        out.push("<blockquote>" + inline(bq[1]) + "</blockquote>");
        return;
      }

      // Unordered list item.
      var ul = /^[-*]\s+(.*)$/.exec(line);
      if (ul) {
        if (!inList) { out.push("<ul>"); inList = true; }
        out.push("<li>" + inline(ul[1]) + "</li>");
        return;
      }

      // Ordered list item.
      var ol = /^\d+\.\s+(.*)$/.exec(line);
      if (ol) {
        if (!inList) { out.push("<ol>"); inList = true; }
        out.push("<li>" + inline(ol[1]) + "</li>");
        return;
      }

      closeList();

      // Blank line -> paragraph break.
      if (line.trim() === "") return;

      // Paragraph (accumulate consecutive non-blank lines).
      out.push("<p>" + inline(line) + "</p>");
    });

    closeList();
    if (inCode) out.push("<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
    return out.join("\n");
  }

  function update() {
    preview.innerHTML = render(editor.value);
  }

  editor.addEventListener("input", update);
  update();
})();
