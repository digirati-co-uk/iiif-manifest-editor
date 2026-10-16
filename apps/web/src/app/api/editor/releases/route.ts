import { getReleaseCatalog } from "../../../../utilties/remote-editor/catalog";

export async function GET(request: Request) {
  try {
    return Response.json(await getReleaseCatalog(request), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Release catalog unavailable" },
      { status: 503 }
    );
  }
}
