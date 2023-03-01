import React from "react";
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
export const TopLevelCollection = () => (
  <IIIFExplorer
    entry={{
      id: "https://iiif.wellcomecollection.org/presentation/collections/digitalcollections/digpaintings",
      type: "Collection",
    }}
  />
);
// export const TopLevelCollection2 = () => (
//   <IIIFExplorer
//     entry={{
//       id: "https://iiif.wellcomecollection.org/presentation/b12012439",
//       type: "Manifest",
//     }}
//   />
// );

// export const TopLevelCollection = () => (
//   <IIIFExplorer entry={{ id: "https://view.nls.uk/manifest/7446/74464117/manifest.json", type: "Manifest" }} />
// );
//
// export const WunderManifest = () => (
//   <IIIFExplorer entry={{ id: "https://digirati-co-uk.github.io/wunder.json", type: "Manifest" }} />
// );
