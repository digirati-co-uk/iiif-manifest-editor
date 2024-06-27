import { HistoryItem, OutputType } from "./IIIFExplorer.types";

export function getOutputType(item: HistoryItem): OutputType {
  if (item.selector && item.type === "Canvas") {
    return "CanvasRegion";
  }

  if (item.listing && item.listing.length && item.type === "Manifest") {
    return "CanvasList";
  }

  return item.type as OutputType;
}
