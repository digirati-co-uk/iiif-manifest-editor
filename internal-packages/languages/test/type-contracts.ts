import { message } from "../src/messages.ts";
import type { CatalogOverlay, CatalogShape } from "../src/schema.ts";
import type { SourceCatalogs } from "../src/catalog-types.ts";

message("common", "actions.cancel");
message("editors", "canvas.count", { values: { count: 2 } });
message("shell", "plugins.loadFailed", { values: { pluginName: "Museum" } });
const overlay: CatalogOverlay<SourceCatalogs["editors"]> = { fields: { label: "Title" } };
const widened: CatalogShape<{ title: "English" }> = { title: "Français" };
void overlay;
void widened;

// @ts-expect-error Namespace typos are rejected.
message("editorz", "fields.label");
// @ts-expect-error Unknown keys are rejected.
message("editors", "unknown.label");
// @ts-expect-error Required interpolation values are required.
message("editors", "canvas.count");
// @ts-expect-error Count is a number, not an arbitrary string.
message("editors", "canvas.count", { values: { count: "two" } });
// @ts-expect-error Interpolation variable names come from the source catalog.
message("shell", "plugins.loadFailed", { values: { name: "Museum" } });
// @ts-expect-error Overlay keys must exist in the namespace.
const invalid: CatalogOverlay<SourceCatalogs["editors"]> = { typo: "Title" };
void invalid;
