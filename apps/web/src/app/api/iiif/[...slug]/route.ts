import { createIIIFPreviewNextApiHandler } from "@manifest-editor/iiif-preview-server/next-app-router";
import { createCloudflarePreviewStore } from "../../../../utilties/cloudflare-preview-store";

const routes = createIIIFPreviewNextApiHandler({
  apiPath: "/api/iiif",
  getStore: () => createCloudflarePreviewStore(),
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
