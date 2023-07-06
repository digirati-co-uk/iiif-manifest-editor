import { lazy } from "react";
import { LayoutPanel } from "@/shell";

export default { id: "collection-explorer", title: "Collection explorer", type: "launcher" };

const IIIFBrowser = lazy(() => import("./IIIFBrowser").then((r) => ({ default: r.IIIFBrowser })));

export const centerPanels: LayoutPanel[] = [
  {
    id: "iiif-browser",
    icon: null,
    label: "IIIF Browser",
    render: () => <IIIFBrowser />,
  },
];
