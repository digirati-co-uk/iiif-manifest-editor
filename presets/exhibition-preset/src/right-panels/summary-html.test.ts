import { describe, expect, test } from "vitest";
import { normalizeSummaryForSave, sanitizeSummaryHtml } from "./summary-html";

const iiifImage =
  '<img src="https://example.org/iiif/image/full/max/0/default.jpg" alt="A &quot;quoted&quot; image" data-iiif-image="true" />';

describe("summary HTML", () => {
  test("preserves a safe IIIF image when saving a painting annotation summary", () => {
    expect(normalizeSummaryForSave({ en: [iiifImage] })).toEqual({
      en: [iiifImage],
    });
  });

  test("only permits the IIIF marker on images with the value true", () => {
    const html = sanitizeSummaryHtml(
      '<p data-iiif-image="true">Text</p>' +
        '<a href="https://example.org" target="_blank" onclick="alert(1)">Link</a>' +
        '<img src="javascript:alert(1)" data-iiif-image="false" onclick="alert(1)" alt="Unsafe">' +
        '<a href="java&#115;cript:alert(1)">Entity scheme</a>' +
        '<a href="javascript&colon;alert(1)">Encoded colon</a>' +
        '<a href="https://example.org/?first=1&amp;second=2">Safe query</a>' +
        '<a href="https://example.org" target="_BLANK">Case-insensitive target</a>' +
        '<img src="java\nscript:alert(1)" alt="Whitespace scheme">' +
        '<div><img src="javascript:alert(1)" alt="Nested"></div>' +
        iiifImage,
    );

    expect(html).toBe(
      '<p>Text</p><a href="https://example.org" target="_blank" rel="noopener noreferrer">Link</a><img alt="Unsafe"><a>Entity scheme</a><a>Encoded colon</a><a href="https://example.org/?first=1&amp;second=2">Safe query</a><a href="https://example.org" target="_BLANK" rel="noopener noreferrer">Case-insensitive target</a><img alt="Whitespace scheme"><img alt="Nested"><img src="https://example.org/iiif/image/full/max/0/default.jpg" alt="A &quot;quoted&quot; image" data-iiif-image="true" />',
    );
  });
});
