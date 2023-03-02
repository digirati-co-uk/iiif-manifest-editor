import { ImageCandidateRequest } from "@atlas-viewer/iiif-image-api";
import { Vault } from "@iiif/vault";
import { Reference } from "@iiif/presentation-3";

export interface ExplorerAction<Type extends OutputTarget["type"]> {
  label: string;
  format?: OutputFormat;
  action: (resource: any, options: GetOutputTarget<Type>) => Promise<any | void> | any | void;
}

export interface ExplorerFormat<Type extends OutputFormat["type"]> {
  label: string;
  supportedTypes: OutputType[];
  format: (
    resource: any,
    options: GetOutputFormat<Type>,
    parentResource: any | null,
    vault: Vault
  ) => Promise<any> | any;
}

export type OutputType = "Collection" | "Manifest" | "Canvas" | "ImageService" | "CanvasRegion" | "ImageServiceRegion";

export type OutputFormat =
  | { type: "content-state"; encoded?: boolean }
  | { type: "json"; pretty?: boolean }
  | { type: "custom"; format: (resource: string, parent?: string) => any }
  | { type: "thumbnail"; options?: ImageCandidateRequest }
  | { type: "url" };

export type OutputTarget =
  | { type: "callback"; label?: string; format?: OutputFormat; cb: (resource: any) => void }
  | { type: "clipboard"; label?: string; format?: OutputFormat }
  | { type: "input"; label?: string; format?: OutputFormat; el: { current: null | HTMLInputElement } }
  | {
      type: "open-new-window";
      label?: string;
      format?: OutputFormat;
      urlPattern: string;
      target?: string;
      features?: string;
      cb?: (resource: any, window: Window | null) => void;
    };

export type GetOutputFormat<Type extends OutputFormat["type"]> = InferFromType<OutputFormat, Type>;
export type GetOutputTarget<Type extends OutputTarget["type"]> = InferFromType<OutputTarget, Type>;

export type InferFromType<
  Input extends { type: string },
  Type extends Input["type"],
  AllTargets = Input
> = AllTargets extends {
  type: Type;
}
  ? AllTargets
  : never;
