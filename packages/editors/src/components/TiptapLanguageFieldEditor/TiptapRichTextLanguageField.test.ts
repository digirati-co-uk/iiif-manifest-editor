import { describe, expect, test } from "vitest";
import { htmlToStoredValue, isHtmlValue, textToHtml } from "./text-to-html";

describe("existing HTML detection", () => {
  test("recognizes imported markup without requiring conformant wrapping or whitespace", () => {
    for (const value of ["<p>Title</p>", " <p>Title</p> ", "Title with <b>formatting</b>", '<img src="image.jpg">']) {
      expect(isHtmlValue(value)).toBe(true);
    }
  });

  test("keeps literal angle brackets in plain text", () => {
    for (const value of ["", "Plain title", "<3", "< 3 >", "A & B < C", "&lt;p&gt;Title&lt;/p&gt;"]) {
      expect(isHtmlValue(value)).toBe(false);
    }
  });
});

describe("plain text conversion", () => {
  test("escapes literal markup and entities rather than stripping or interpreting them", () => {
    expect(textToHtml('A & B <script>alert("hello")</script> &amp;')).toBe(
      '<p>A &amp; B &lt;script&gt;alert("hello")&lt;/script&gt; &amp;amp;</p>'
    );
  });

  test("preserves line breaks and empty paragraphs", () => {
    expect(textToHtml("First\nsecond\n\nThird")).toBe("<p>First<br>second</p><p>Third</p>");
    expect(textToHtml("")).toBe("<p><br></p>");
    expect(textToHtml("First\n\n\n\nLast")).toBe("<p>First</p><p><br></p><p>Last</p>");
    expect(textToHtml("First\r\nsecond\rthird")).toBe("<p>First<br>second<br>third</p>");
  });
});

describe("stored HTML simplification", () => {
  test("collapses a single plain paragraph to text", () => {
    expect(htmlToStoredValue("<p>Plain title</p>")).toBe("Plain title");
    expect(htmlToStoredValue("<p>A &amp; B &gt; C</p>")).toBe("A & B > C");
    expect(htmlToStoredValue("<p></p>")).toBe("");
  });

  test("keeps HTML that carries formatting, structure or attributes", () => {
    for (const html of [
      "<p><strong>Bold</strong></p>",
      "<p>First</p><p>Second</p>",
      "<p>Line<br>break</p>",
      '<p lang="en">Tagged</p>',
      "<h1>Heading</h1>",
      "<p>&lt;3 starts like markup</p>",
    ]) {
      expect(htmlToStoredValue(html)).toBe(html);
    }
  });
});
