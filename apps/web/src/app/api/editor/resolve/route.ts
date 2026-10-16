import { getReleaseCatalog } from "../../../../utilties/remote-editor/catalog";
import { resolveRelease } from "../../../../../../../packages/manifest-editor/src/remote/releases";

export async function POST(request: Request) {
  let input;
  try {
    const body = await request.text();
    if (body.length > 2048) throw new Error("Request too large");
    input = JSON.parse(body);
    if (
      !input ||
      typeof input.selection !== "string" ||
      !Number.isInteger(input.host?.runtimeApiVersion) ||
      !Number.isInteger(input.host?.reactMajor)
    ) {
      throw new Error("Expected selection and host runtimeApiVersion/reactMajor");
    }
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Invalid request" }, { status: 400 });
  }
  let catalog;
  try {
    catalog = await getReleaseCatalog(request);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Release catalog unavailable" },
      { status: 503 }
    );
  }
  try {
    return Response.json(
      { selection: input.selection, release: resolveRelease(catalog, input.selection, input.host) },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to resolve release" },
      { status: 422 }
    );
  }
}
