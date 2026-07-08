import { sanitizeSummaryHtml } from "../right-panels/summary-html";

export const DEFAULT_TOUR_STEP_LABEL = "New step";
export const DEFAULT_TOUR_STEP_SUMMARY = "<p>Description</p>";
export const DEFAULT_TOUR_STEP_HTML = joinTourStepHtml(
  DEFAULT_TOUR_STEP_LABEL,
  DEFAULT_TOUR_STEP_SUMMARY,
);

export function splitTourStepHtml(value: string | null | undefined) {
  const html = value || "";

  if (typeof document !== "undefined") {
    const template = document.createElement("template");
    template.innerHTML = html;
    const firstElement = Array.from(template.content.childNodes).find(
      (node): node is HTMLElement => node.nodeType === Node.ELEMENT_NODE,
    );

    if (firstElement && /^h[1-6]$/i.test(firstElement.tagName)) {
      const label = firstElement.textContent?.trim() || "";
      firstElement.remove();
      return { label, summary: template.innerHTML.trim() };
    }
  }

  const match = html.match(/^\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>\s*/i);
  if (!match) return { label: "", summary: html };

  return {
    label: stripHtml(match[1] || "").trim(),
    summary: html.slice(match[0].length).trim(),
  };
}

export function joinTourStepHtml(label: string, summary: string) {
  const cleanLabel = escapeHtml(label.trim() || DEFAULT_TOUR_STEP_LABEL);
  const cleanSummary = sanitizeSummaryHtml(summary || "");

  return `<h2>${cleanLabel}</h2>${cleanSummary}`;
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
