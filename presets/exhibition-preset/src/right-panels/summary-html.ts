import type { InternationalString } from "@iiif/presentation-3";

const allowedTags = new Set([
  "a",
  "blockquote",
  "br",
  "code",
  "em",
  "h1",
  "h2",
  "h3",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strong",
  "u",
  "ul",
]);

const allowedAttributes: Record<string, Set<string>> = {
  a: new Set(["href", "rel", "target", "title"]),
  img: new Set(["alt", "loading", "src", "title"]),
};

export function normalizeSummaryForHtmlEditor(value: unknown): InternationalString {
  const languageMap = toLanguageMap(value);
  const normalized: InternationalString = {};

  for (const [language, values] of Object.entries(languageMap)) {
    const html = values
      .filter((item): item is string => typeof item === "string")
      .map((item) => (isHtmlValue(item) ? sanitizeSummaryHtml(item) : textToParagraphHtml(item)))
      .filter(Boolean)
      .join("");

    if (html) {
      normalized[language] = [html];
    }
  }

  return normalized;
}

export function normalizeSummaryForSave(value: InternationalString): InternationalString {
  const normalized: InternationalString = {};

  for (const [language, values] of Object.entries(value || {})) {
    const html = (values || [])
      .filter((item): item is string => typeof item === "string")
      .map((item) => (isHtmlValue(item) ? sanitizeSummaryHtml(item) : textToParagraphHtml(item)))
      .filter(Boolean)
      .join("");

    if (html) {
      normalized[language] = [html];
    }
  }

  return normalized;
}

export function getLanguageMapHtml(value: unknown): string {
  return Object.values(normalizeSummaryForHtmlEditor(value))
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .filter((item): item is string => typeof item === "string")
    .join("");
}

export function sanitizeSummaryHtml(value: string): string {
  if (typeof document === "undefined") {
    return sanitizeSummaryHtmlFallback(value);
  }

  const template = document.createElement("template");
  template.innerHTML = value || "";

  sanitizeNode(template.content);

  return template.innerHTML;
}

function sanitizeNode(node: Node) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (!allowedTags.has(tagName)) {
        element.replaceWith(...Array.from(element.childNodes));
        continue;
      }

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        const allowed = allowedAttributes[tagName]?.has(name) || false;
        const unsafeUrl =
          (name === "href" || name === "src") && /^(javascript|data):/i.test(attribute.value.trim());

        if (!allowed || unsafeUrl) {
          element.removeAttribute(attribute.name);
        }
      }

      if (tagName === "a" && element.getAttribute("target") === "_blank") {
        element.setAttribute("rel", "noopener noreferrer");
      }
    }

    sanitizeNode(child);
  }
}

function toLanguageMap(value: unknown): Record<string, string[]> {
  if (!value) return {};
  if (typeof value === "string") return { none: [value] };
  if (Array.isArray(value)) return { none: value.filter((item): item is string => typeof item === "string") };

  if (typeof value === "object") {
    const entries: Record<string, string[]> = {};

    for (const [language, item] of Object.entries(value)) {
      const values = Array.isArray(item) ? item : [item];
      entries[language] = values.filter((entry): entry is string => typeof entry === "string");
    }

    return entries;
  }

  return {};
}

function isHtmlValue(value: string) {
  return value.trimStart().startsWith("<");
}

function textToParagraphHtml(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeSummaryHtmlFallback(value: string) {
  return (value || "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(href|src)\s*=\s*(["'])\s*(?:javascript|data):[^"']*\2/gi, "");
}
