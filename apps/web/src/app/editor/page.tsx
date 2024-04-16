"use client";

import { ManifestEditor } from "manifest-editor";
import "manifest-editor/dist/index.css";

const manifest = {
  "@context": "http://iiif.io/api/presentation/3/context.json",
  id: "/config/manifest-templates/blank.json",
  type: "Manifest",
  label: {
    en: ["Blank Manifest"],
  },
  items: [],
};

export default function EditorPage() {
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", maxWidth: "100%", minWidth: 0 }}>
      <ManifestEditor resource={{ id: manifest.id, type: "Manifest" }} data={manifest as any} />
    </div>
  );
}
