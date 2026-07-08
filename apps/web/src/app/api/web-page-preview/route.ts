import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const userAgent = "Mozilla/5.0 (compatible; IIIFManifestEditor/1.0; +https://manifest-editor.digirati.services)";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const target = getHttpUrl(body && typeof body === "object" && "url" in body ? body.url : "");

  if (!target) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const response = await fetch(target, {
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": userAgent,
    },
    redirect: "follow",
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Preview unavailable" }, { status: 502 });
  }

  const html = await response.text();
  return NextResponse.json(extractPreview(html, response.url || target));
}

function getHttpUrl(value: unknown) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function extractPreview(html: string, baseUrl: string) {
  const meta = (name: string) => {
    const pattern = new RegExp(
      `<meta\\s+[^>]*(?:property|name)=["']${escapeRegExp(name)}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta\\s+[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escapeRegExp(name)}["'][^>]*>`,
      "i",
    );
    const match = html.match(pattern);
    return decodeHtml(match?.[1] || match?.[2] || "");
  };
  const title =
    meta("og:title") || meta("twitter:title") || decodeHtml(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]);
  const description = meta("og:description") || meta("twitter:description") || meta("description");
  const image = resolveUrl(meta("og:image") || meta("twitter:image"), baseUrl);

  return { title, description, image };
}

function resolveUrl(value: string, baseUrl: string) {
  try {
    return value ? new URL(value, baseUrl).toString() : "";
  } catch {
    return "";
  }
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
