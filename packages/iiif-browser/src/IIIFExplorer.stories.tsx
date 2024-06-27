import { useLayoutEffect, useRef, useState } from "react";
import { IIIFExplorer } from "./IIIFExplorer";

export default { title: "IIIF Explorer" };

export const Default = () => <IIIFExplorer />;

export const TopLevelCollection = () => (
  <IIIFExplorer entry={{ id: "https://view.nls.uk/collections/top.json", type: "Collection" }} />
);

// export const TopLevelCollection = () => (
//   <IIIFExplorer
//     entry={{
//       id: "https://iiif.wellcomecollection.org/presentation/collections/digitalcollections",
//       type: "Collection",
//     }}
//   />
// );

export const EmptyExplorer = () => <IIIFExplorer />;

export const PaintingsToViewers = () => (
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
);

export const ImageService = () => (
  <IIIFExplorer
    entry={{ id: "https://view.nls.uk/manifest/7446/74464117/manifest.json", type: "Manifest" }}
    output={{ type: "image-service" }}
    outputTargets={[{ type: "open-new-window" }]}
    height={500}
  />
);

export const MultiCanvas = () => (
  <IIIFExplorer
    entry={{ id: "https://view.nls.uk/manifest/7446/74464117/manifest.json", type: "Manifest" }}
    output={{ type: "content-state" }}
    outputTypes={["Canvas", "CanvasList"]}
    outputTargets={[
      {
        label: "Select canvas",
        supportedTypes: ["Canvas"],
        type: "callback",
        cb: (resource) => console.log("Sinlge Canvas -> ", resource),
      },
      {
        label: "Select all canvases",
        supportedTypes: ["CanvasList"],
        type: "callback",
        cb: (resource) => console.log("Canvas list -> ", resource),
      },
    ]}
    height={500}
  />
);

export const WellcomeTopLevel = () => (
  <IIIFExplorer
    entry={{ id: "https://iiif.wellcomecollection.org/presentation/collections", type: "Collection" }}
    height={500}
  />
);
export const ScottishBridges = () => (
  <IIIFExplorer
    entry={{ id: "https://view.nls.uk/manifest/7446/74464117/manifest.json", type: "Manifest" }}
    height={500}
  />
);

export const WunderManifest = () => (
  <IIIFExplorer entry={{ id: "https://digirati-co-uk.github.io/wunder.json", type: "Manifest" }} height={500} />
);

export const EmptyExplorerSized = () => (
  <div style={{ margin: 20, border: "1px solid red", height: 400, width: 400 }}>
    <IIIFExplorer />
  </div>
);

export const ContentState = () => {
  const input = useRef<HTMLTextAreaElement>(null);
  const [checked, setChecked] = useState(false);

  return (
    <>
      <label>
        <input type="checkbox" onChange={(e) => setChecked(e.target.checked)} />
        Encoded
      </label>
      <textarea ref={input} style={{ height: "120px", width: "100%" }} />
      <IIIFExplorer
        allowRemoveEntry
        outputTypes={["Manifest", "Canvas", "CanvasRegion", "CanvasList"]}
        output={{ type: "content-state", encoded: checked }}
        outputTargets={[
          {
            type: "input",
            el: input as any,
            label: "Paste to input",
          },
          {
            type: "clipboard",
          },
        ]}
        entry={{ id: "https://digirati-co-uk.github.io/wunder.json", type: "Manifest" }}
        height={500}
      />
    </>
  );
};

export const Thumbnail = () => {
  const input = useRef<HTMLTextAreaElement>(null);
  const [size, setSize] = useState(256);

  return (
    <>
      <div style={{ marginBottom: 30 }}>
        <label>
          size
          <input type="number" value={size} onChange={(e) => setSize(e.target.valueAsNumber)} />
        </label>
      </div>
      <IIIFExplorer
        allowRemoveEntry
        output={{ type: "thumbnail", options: { width: size } }}
        outputTargets={[
          {
            label: "Open thumbnail",
            type: "open-new-window",
            urlPattern: "{RESULT}",
          },
          {
            label: "Copy to clipboard",
            type: "clipboard",
          },
        ]}
        entry={{
          id: "https://iiif.wellcomecollection.org/presentation/collections/digitalcollections/digpaintings",
          type: "Collection",
        }}
        height={500}
      />
    </>
  );
};

export const EmptyExplorerWithInput = () => {
  const input = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    if (isOpen) {
      const listener = (e: MouseEvent) => {
        if (e.target !== input.current) {
          setIsOpen(false);
        }
      };
      window.addEventListener("click", listener);

      return () => {
        window.removeEventListener("click", listener);
      };
    }
  }, [isOpen]);

  return (
    <div style={{ height: 800 }}>
      <div style={{ width: 400, position: "relative" }}>
        <input ref={input} type="text" style={{ height: "30px", width: "100%" }} onFocus={() => setIsOpen(true)} />
        {isOpen ? (
          <div
            style={{ height: 400, width: 400, paddingTop: "2px", position: "absolute" }}
            ref={container}
            onClick={(e) => e.stopPropagation()}
          >
            <IIIFExplorer
              outputTypes={["Manifest"]}
              output={{ type: "url" }}
              outputTargets={[
                {
                  type: "input",
                  el: input,
                  label: "Select",
                },
              ]}
              onSelect={() => {
                input.current?.focus();
                setIsOpen(false);
              }}
              entry={{
                id: "https://iiif.wellcomecollection.org/presentation/collections/digitalcollections/digpaintings",
                type: "Collection",
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};
