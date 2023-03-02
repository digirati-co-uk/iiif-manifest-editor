export interface ExplorerAction<Type extends OutputTarget["type"]> {
  label: string;
  action: (resource: any, options: GetOutputTarget<Type>) => Promise<any | void> | any | void;
}

export interface ExplorerFormat<Type extends OutputFormat["type"]> {
  label: string;
  supportedTypes: OutputType[];
  format: (resource: any, options: GetOutputFormat<Type>, parentResource?: any) => Promise<any> | any;
}

export type OutputType = "Collection" | "Manifest" | "Canvas" | "ImageService" | "CanvasRegion" | "ImageServiceRegion";

export type OutputFormat =
  | { type: "content-state"; encoded?: boolean }
  | { type: "json"; pretty?: boolean }
  | { type: "custom"; format: (resource: string, parent?: string) => any }
  | { type: "url" };

export type OutputTarget =
  | { type: "callback"; label?: string; cb: (resource: any) => void }
  | { type: "clipboard"; label?: string }
  | { type: "input"; label?: string; el: HTMLInputElement }
  | {
      type: "open-new-window";
      label?: string;
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
