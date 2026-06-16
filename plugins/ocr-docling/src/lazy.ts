import type { LazyPluginModule } from "@manifest-editor/shell";
import metadata, { settings } from "./plugin";

export default {
  default: metadata,
  settings,
  load: () => import("./index"),
} satisfies LazyPluginModule;
