import { createMemoryStore } from "@manifest-editor/iiif-preview-server";
import { createNetlifyStore } from "@manifest-editor/iiif-preview-server/netlify";
import { createIIIFPreviewNextApiHandler } from "@manifest-editor/iiif-preview-server/next-app-router";

const routes = createIIIFPreviewNextApiHandler({
  apiPath: "/api/iiif",
  storage: process.env.NETLIFY_BLOBS_CONTEXT
    ? createNetlifyStore()
    : createMemoryStore(),
  config: {
    accessControlAllowPrivateNetwork: true,
  },
});

export const dynamic = "force-dynamic";

export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
export const HEAD = routes.HEAD;
export const OPTIONS = routes.OPTIONS;
