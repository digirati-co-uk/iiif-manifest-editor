import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { JsonPanel } from "./StoryFrame";

test("highlights JSON values and preserves formatting", () => {
  const html = renderToStaticMarkup(
    <JsonPanel value={{ label: "Canvas", width: 1200, enabled: true, missing: null }} />
  );
  expect(html).toContain('class="token property"');
  expect(html).toContain('class="token string"');
  expect(html).toContain('class="token number"');
  expect(html).toContain('class="token boolean"');
  expect(html).toContain('class="token null keyword"');
  expect(html).toContain('\n  <span class="token property">');
});

test("renders embedded markup as JSON text", () => {
  const html = renderToStaticMarkup(<JsonPanel value={{ value: '<img src=x onerror="alert(1)"> & text' }} />);
  expect(html).not.toContain("<img");
  expect(html).toContain("&lt;img");
  expect(html).toContain("&amp; text");
});

test("keeps serialization errors readable", () => {
  const value: { self?: unknown } = {};
  value.self = value;
  const html = renderToStaticMarkup(<JsonPanel value={value} />);
  expect(html.replace(/<[^>]+>/g, "")).toContain("Unable to serialise:");
});
