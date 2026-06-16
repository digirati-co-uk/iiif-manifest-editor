import type { LazyPluginModule } from "@manifest-editor/shell";
import metadata from "./plugin";

export default {
  default: metadata,
  load: () => import("./index"),
} satisfies LazyPluginModule;
