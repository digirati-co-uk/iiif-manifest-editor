import { createLazyFileRoute } from "@tanstack/react-router";
import "@manifest-editor/shell/dist/index.css";
import { ManifestEditor } from "manifest-editor";
import wunder from "../wunder.json";

const manifest = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "/config/manifest-templates/blank.json",
  type: "Manifest",
  label: {
    en: ["Blank Manifest"],
  },
  items: [],
};

// exampleApp

export const Route = createLazyFileRoute("/shell")({
  component: () => (
    <div style={{ width: "100%", height: 800, display: "flex", maxWidth: "100%", minWidth: 0 }}>
      <ManifestEditor resource={{ id: wunder.id, type: "Manifest" }} data={wunder as any} />
    </div>
  ),
});
