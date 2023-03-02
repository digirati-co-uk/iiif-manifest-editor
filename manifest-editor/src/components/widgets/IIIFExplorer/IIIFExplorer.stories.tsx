import React, { useRef, useState } from "react";
import { IIIFExplorer } from "@/components/widgets/IIIFExplorer/IIIFExplorer";

export default { title: "IIIF Explorer" };

// export const Default = () => <IIIFExplorer />;

// export const TopLevelCollection = () => (
//   <IIIFExplorer entry={{ id: "https://view.nls.uk/collections/top.json", type: "Collection" }} />
// );

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
    outputTypes={["Manifest"]}
    output={{ type: "url" }}
    outputTargets={[
      {
        type: "open-new-window",
        urlPattern: "https://uv-v4.netlify.app/#?iiifManifestId={RESULT}",
        label: "Open in UV",
      },
      {
        type: "open-new-window",
        label: "Open in Clover",
        urlPattern: "https://samvera-labs.github.io/clover-iiif/?iiif-content={RESULT}",
      },
      {
        type: "open-new-window",
        label: "Open in Mirador",
        urlPattern: "https://tomcrane.github.io/scratch/mirador3/index.html?iiif-content={RESULT}",
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

export const EmptyExplorerWithInput = () => {
  const input = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ height: 800 }}>
      <div style={{ width: 400, position: "relative" }}>
        <input ref={input} type="text" style={{ height: "30px", width: "100%" }} onFocus={() => setIsOpen(true)} />
        {isOpen ? (
          <div style={{ height: 400, width: 400, position: "absolute" }}>
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
