import React from "react";
import { IIIFExplorer } from "@/components/widgets/IIIFExplorer/IIIFExplorer";

export default { title: "IIIF Explorer" };

export const Default = () => <IIIFExplorer />;

export const TopLevelCollection = () => (
  <IIIFExplorer entry={{ id: "https://view.nls.uk/collections/top.json", type: "Collection" }} />
);
