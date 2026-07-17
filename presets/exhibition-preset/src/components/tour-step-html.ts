import { sanitizeSummaryHtml } from "../right-panels/summary-html";

export const DEFAULT_TOUR_STEP_SUMMARY = "<p>Description</p>";
export const DEFAULT_TOUR_STEP_HTML = DEFAULT_TOUR_STEP_SUMMARY;

export function splitTourStepHtml(value: string | null | undefined) {
  const html = value || "";

  if (typeof document !== "undefined") {
    const template = document.createElement("template");
    template.innerHTML = html;
    const firstNode = Array.from(template.content.childNodes).find(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE ||
        (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()),
    );

    if (
      firstNode?.nodeType === Node.ELEMENT_NODE &&
      /^h[1-6]$/i.test((firstNode as HTMLElement).tagName)
    ) {
      const label = firstNode.textContent?.trim() || "";
      firstNode.remove();
      return { label, summary: template.innerHTML.trim() };
    }

    return { label: undefined, summary: html };
  }

  const match = html.match(/^\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*/i);
  if (!match) return { label: undefined, summary: html };

  return {
    label: stripHtml(match[1] || "").trim(),
    summary: html.slice(match[0].length).trim(),
  };
}

export function joinTourStepHtml(label: string | undefined, summary: string) {
  const cleanLabel = label?.trim() ? `<h2>${escapeHtml(label.trim())}</h2>` : "";
  const cleanSummary = sanitizeSummaryHtml(summary || "");

  return `${cleanLabel}${cleanSummary}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
