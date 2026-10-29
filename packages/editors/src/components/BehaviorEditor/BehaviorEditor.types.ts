import type { MessageReference } from "@manifest-editor/i18n";
import { InternationalString } from "@iiif/presentation-3";
import { ReactNode } from "react";

export type BehaviorEditorConfiguration = BehaviorChoice | BehaviorTemplate | BehaviorCustom;

export interface BehaviorChoice {
  id: string;
  label: InternationalString;
  labelMessage?: MessageReference;
  type: "choice";
  addNone?: boolean;
  groupBehavior?: string;
  items: Array<{
    value: string;
    label: InternationalString;
    labelMessage?: MessageReference;
  }>;
  initialOpen?: boolean;
}

export interface BehaviorTemplate {
  id: string;
  label: InternationalString;
  labelMessage?: MessageReference;
  type: "template";
  template: string;
  regex: RegExp;
  options: Array<BehaviorChoice & { key: string }>;
  initialOpen?: boolean;
}

export interface BehaviorCustom {
  id: string;
  label: InternationalString;
  labelMessage?: MessageReference;
  type: "custom";
  component: (behavior: string[], setBehaviors: (b: string[]) => void) => ReactNode;
  supports: (behavior: string) => boolean;
  initialOpen?: boolean;
}
