import { createIIIFPreviewNextApiHandler } from "@manifest-editor/iiif-preview-server/next-app-router";
import { createNetlifyStore } from "@manifest-editor/iiif-preview-server/netlify";
import { createMemoryStore } from "@manifest-editor/iiif-preview-server";

const routes = createIIIFPreviewNextApiHandler({
  apiPath: "/api/iiif",
  storage: process.env.NETLIFY_BLOBS_CONTEXT ? createNetlifyStore() : createMemoryStore(),
});

export const dynamic = "force-dynamic";

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
export const HEAD = routes.HEAD;
export const OPTIONS = routes.OPTIONS;
