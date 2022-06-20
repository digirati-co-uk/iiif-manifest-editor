import { ReactNode } from "react";
import { Reference } from "@iiif/presentation-3";
import * as React from "react";

export interface UniversalCopyPasteProps<T> {
  as?: keyof JSX.IntrinsicElements | React.ComponentType<T>;
  children?: ReactNode;
  reference?: Reference;
  onPasteReference?: (reference: Reference) => void;
  onDropReference?: (reference: Reference, e: DragEvent) => void;
  onPasteLink?: (link: string) => void;
  onPasteAnalysis?: (analysisResults: any) => void;
  onLoading?: () => void;
  onComplete?: () => void;
}
