import { createLazyFileRoute } from "@tanstack/react-router";
import { IIIFExplorer } from "@manifest-editor/iiif-browser";
import "@manifest-editor/iiif-browser/dist/index.css";

export const Route = createLazyFileRoute("/explorer")({
  component: () => {
    return (
      <div>
        <IIIFExplorer
          entry={{
            id: "https://iiif.wellcomecollection.org/presentation/collections/digitalcollections/digpaintings",
            type: "Collection",
          }}
          outputTypes={["Manifest", "Canvas", "CanvasRegion"]}
          output={{ type: "url", resolvable: false }}
          outputTargets={[
            {
              type: "open-new-window",
              urlPattern: "https://uv-v4.netlify.app/#?iiifManifestId={MANIFEST}&cv={CANVAS_INDEX}&xywh={XYWH}",
              label: "Open in UV",
            },
            {
              type: "open-new-window",
              label: "Open in Clover",
              urlPattern: "https://samvera-labs.github.io/clover-iiif/?iiif-content={MANIFEST}",
            },
            {
              type: "open-new-window",
              label: "Open in Mirador",
              urlPattern: "https://tomcrane.github.io/scratch/mirador3/index.html?iiif-content={MANIFEST}",
            },
            {
              type: "open-new-window",
              label: "Open JSON-LD",
              urlPattern: "{RESULT}",
            },
          ]}
          height={500}
        />
      </div>
    );
  },
});
