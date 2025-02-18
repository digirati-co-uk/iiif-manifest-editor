import { InternationalString } from "@iiif/presentation-3";
import { ReactNode } from "react";

export type BehaviorEditorConfiguration = BehaviorChoice | BehaviorTemplate | BehaviorCustom;

export interface BehaviorChoice {
  id: string;
  label: InternationalString;
  type: "choice";
  addNone?: boolean;
  items: Array<{
    value: string;
    label: InternationalString;
  }>;
  initialOpen?: boolean;
}

export interface BehaviorTemplate {
  id: string;
  label: InternationalString;
  type: "template";
  template: string;
  regex: RegExp;
  options: Array<BehaviorChoice & { key: string }>;
  initialOpen?: boolean;
}

export interface BehaviorCustom {
  id: string;
  label: InternationalString;
  type: "custom";
  component: (behavior: string[], setBehaviors: (b: string[]) => void) => ReactNode;
  supports: (behavior: string) => boolean;
  initialOpen?: boolean;
}
