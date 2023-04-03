import { ReactNode } from "react";
import { Reference } from "@iiif/presentation-3";
import * as React from "react";

export interface UniversalCopyPasteProps<T> {
  as?: keyof JSX.IntrinsicElements | React.ComponentType<T>;
  children?: ReactNode;
  reference?: Reference;
  onReference?: (reference: Reference) => void;
  onPasteReference?: (reference: Reference) => void;
  onDropReference?: (reference: Reference, e: DragEvent) => void;
  onLink?: (link: string) => void;
  onPasteLink?: (link: string) => void;
  onDropLink?: (link: string) => void;
  onAnalysis?: (analysisResults: any) => void;
  onPasteAnalysis?: (analysisResults: any) => void;
  onDropAnalysis?: (analysisResults: any) => void;
  onLoading?: () => void;
  onComplete?: () => void;
}
