import { Converter } from "showdown";
import TurndownService from "turndown";

const converter = new Converter();
converter.setFlavor("github");

const turndownService = new TurndownService();
turndownService.addRule("iiif-image", {
  filter: (node) =>
    node.nodeName === "IMG" && node.getAttribute("data-iiif-image") === "true",
  replacement: (_content, node) => (node as HTMLElement).outerHTML,
});

export function htmlToMarkdown(value: string) {
  return turndownService.turndown(value);
}

export function markdownToHtml(value: string) {
  return converter.makeHtml(value);
}
