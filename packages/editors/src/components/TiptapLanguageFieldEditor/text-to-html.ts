/** Recognize existing markup, including imported HTML surrounded by plain text or whitespace. */
export function isHtmlValue(value: string) {
  return /<\/?[a-z][^>]*>/i.test(value);
}

export function textToHtml(value: string) {
  const escaped = value.replace(/\r\n?/g, "\n").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .split("\n\n")
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>") || "<br>"}</p>`)
    .join("");
}

const basicEntities: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

/**
 * Collapses HTML that is only a single, attribute-free paragraph of text
 * (e.g. `<p>Title</p>`) back to plain text, so we don't store markup that adds nothing.
 */
export function htmlToStoredValue(html: string) {
  const match = /^\s*<p>([^<]*)<\/p>\s*$/.exec(html);
  if (!match || /&(?!(amp|lt|gt|nbsp);)/.test(match[1]!)) return html;
  const text = match[1]!.replace(/&(amp|lt|gt|nbsp);/g, (entity) => basicEntities[entity]!);
  // Plain text starting with "<" would be read back as HTML.
  return /^\s*</.test(text) ? html : text;
}
