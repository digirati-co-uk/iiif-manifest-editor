import { createRoot } from "react-dom/client";
import { IIIFExplorer, IIIFExplorerProps } from "./IIIFExplorer";
import { createElement } from "react";

export function create(element: HTMLElement, props: IIIFExplorerProps) {
  const root = createRoot(element);
  root.render(createElement(IIIFExplorer, props));

  return {
    update: (props: IIIFExplorerProps) => {
      root.render(createElement(IIIFExplorer, props));
    },
    umount: () => root.unmount(),
  };
}
