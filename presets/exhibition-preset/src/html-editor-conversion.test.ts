import { describe, expect, test } from "vitest";
import {
  htmlToMarkdown,
  markdownToHtml,
} from "../../../packages/components/src/html-editor-conversion";

describe("HTML editor conversion", () => {
  test("preserves IIIF image attributes through an HTML round trip", () => {
    const html =
      '<p>Before</p><img src="https://example.org/iiif/image/full/max/0/default.jpg" alt="A &quot;quoted&quot; image" data-iiif-image="true"><p>After</p>';

    const markdown = htmlToMarkdown(html);
    const roundTrip = markdownToHtml(markdown);

    expect(markdown).toContain(
      '<img src="https://example.org/iiif/image/full/max/0/default.jpg" alt="A &quot;quoted&quot; image" data-iiif-image="true" />',
    );
    expect(roundTrip).toContain(
      '<img src="https://example.org/iiif/image/full/max/0/default.jpg" alt="A &quot;quoted&quot; image" data-iiif-image="true" />',
    );
    expect(roundTrip).toContain("<p>Before</p>");
    expect(roundTrip).toContain("<p>After</p>");
  });
});
