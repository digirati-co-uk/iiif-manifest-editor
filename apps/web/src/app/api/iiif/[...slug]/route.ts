import { createIIIFPreviewNextApiHandler } from "@manifest-editor/iiif-preview-server/next-app-router";

const routes = createIIIFPreviewNextApiHandler({
  apiPath: "/api/iiif",
});

export const dynamic = routes.dynamic;
export const GET = routes.GET;
export const POST = routes.POST;
export const PUT = routes.PUT;
export const DELETE = routes.DELETE;
export const HEAD = routes.HEAD;
export const OPTIONS = routes.OPTIONS;
