import type { UIMessage } from "@ai-sdk/react";
import { safeJsonStringify } from "./utils";

function isToolPart(part: any): part is any {
  return part?.type === "dynamic-tool" || (typeof part?.type === "string" && part.type.startsWith("tool-"));
}

function formatToolName(toolName: string) {
  const trimmed = toolName.startsWith("me_") ? toolName.slice(3) : toolName;
  return trimmed
    .split("_")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatToolPart(part: any) {
  const toolName = part.type === "dynamic-tool" ? part.toolName : String(part.type || "").replace(/^tool-/, "");
  const sections: string[] = [`Tool: ${formatToolName(toolName)}`];

  if (part.input) {
    sections.push("Input");
    sections.push(safeJsonStringify(part.input));
  }

  if (typeof part.output !== "undefined") {
    sections.push("Output");
    sections.push(safeJsonStringify(part.output));
  } else if (part.errorText) {
    sections.push("Error");
    sections.push(part.errorText);
  }

  return sections.join("\n");
}

function formatMessageBody(message: UIMessage) {
  const sections: string[] = [];

  for (const part of message.parts || []) {
    if (part.type === "text" && part.text) {
      sections.push(part.text);
      continue;
    }

    if (part.type === "file") {
      sections.push(part.filename ? `${part.filename}: ${part.url}` : part.url);
      continue;
    }

    if (part.type === "reasoning" || part.type === "step-start") {
      continue;
    }

    if (isToolPart(part)) {
      sections.push(formatToolPart(part));
    }
  }

  return sections.join("\n\n").trim();
}

export function formatConversationForClipboard(options: {
  title?: string | null;
  messages: UIMessage[];
}) {
  const lines: string[] = [];

  if (options.title) {
    lines.push(options.title);
  }

  for (const message of options.messages) {
    const body = formatMessageBody(message);
    if (!body) {
      continue;
    }

    if (lines.length) {
      lines.push("");
    }

    lines.push(message.role === "user" ? "User" : message.role === "assistant" ? "Assistant" : "System");
    lines.push(body);
  }

  return lines.join("\n").trim();
}

export async function copyTextToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard access is unavailable");
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = typeof (document as any).execCommand === "function" ? (document as any).execCommand("copy") : false;
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Clipboard copy failed");
  }
}
