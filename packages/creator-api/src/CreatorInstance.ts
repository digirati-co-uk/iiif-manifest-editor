import type { Vault } from "@iiif/helpers/vault";
import type { Reference, SpecificResource } from "@iiif/presentation-3";
import type { InputShape } from "polygon-editor";
import { CreatorResource } from "./CreatorResource";
import { CreatorRuntime } from "./CreatorRuntime";
import { ReferencedResource } from "./ReferencedResource";
import type { CreatorDefinitionFilterByParent, ExtractCreatorGenerics, IIIFManifestEditor } from "./creator-register";
import type {
  AllAvailableParentTypes,
  CreatorDefinition,
  CreatorFunctionContext,
  CreatorOptions,
  GetSupportedResourceFields,
} from "./types";
import { randomId } from "./utils";

export class CreatorInstance implements CreatorFunctionContext {
  vault: Vault;
  previewVault: Vault;
  configs: CreatorDefinition[];
  options: CreatorOptions;

  constructor(vault: Vault, options: CreatorOptions, createConfigs: CreatorDefinition[], previewVault: Vault) {
    this.vault = vault;
    this.previewVault = previewVault;
    this.options = options;
    this.configs = createConfigs;
  }

  getPreviewVault() {
    return this.previewVault;
  }

  getTarget(): SpecificResource | Reference | undefined {
    const target = this.options.target || this.options.parent?.resource;
    const position: any = this.options.initialData?.selector;
    if (position && position.type === "polygon") {
      // Do something
      // Check if its a box selector.
      const position: { type: "polygon"; shape: InputShape } = this.options.initialData?.selector;
      const { width, height } = this.options.initialData?.on || {};

      if (position.shape.points.length === 0) {
        return target;
      }

      if (position.shape.points.length === 1) {
        const points = position.shape.points[0] as [number, number];
        return {
          type: "SpecificResource",
          source: target,
          selector: {
            type: "PointSelector",
            x: points[0],
            y: points[1],
          },
        };
      }

      // Maybe box?
      if (position.shape.points.length === 4) {
        const [topLeft, topRight, bottomRight, bottomLeft] = position.shape.points as [
          [number, number],
          [number, number],
          [number, number],
          [number, number],
        ];

        if (
          topLeft[0] === topRight[0] &&
          topLeft[1] === bottomLeft[1] &&
          topRight[1] === bottomRight[1] &&
          bottomLeft[0] === bottomRight[0]
        ) {
          const x = Math.min(topLeft[0], topRight[0], bottomRight[0], bottomLeft[0]);
          const y = Math.min(topLeft[1], topRight[1], bottomRight[1], bottomLeft[1]);

          const x2 = Math.max(topLeft[0], topRight[0], bottomRight[0], bottomLeft[0]);
          const y2 = Math.max(topLeft[1], topRight[1], bottomRight[1], bottomLeft[1]);
          const width = x2 - x;
          const height = y2 - y;

          // It's a box.
          return {
            type: "SpecificResource",
            source: target,
            selector: {
              type: "FragmentSelector",
              value: `xywh=${[~~x, ~~y, ~~width, ~~height].join(",")}`,
            },
          };
        }
        // No it's a polygon.
      }
      const el = position.shape.open ? "polyline" : "polygon";
      return {
        type: "SpecificResource",
        source: target,
        selector: {
          type: "SvgSelector",
          value: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><${el} points="${position.shape.points.map((p: any) => p.join(",")).join(" ")}" /></svg>`,
        },
      };
    }

    if (target && position) {
      return {
        type: "SpecificResource",
        source: target,
        selector: {
          type: "FragmentSelector",
          value: `xywh=${[~~position.x, ~~position.y, ~~position.width, ~~position.height].join(",")}`,
        },
      };
    }

    return target;
  }

  getParent(): Reference | undefined {
    return this.options.parent?.resource;
  }
  getParentResource(): SpecificResource | undefined {
    const parent = this.getParent();
    if (parent) {
      return {
        type: "SpecificResource",
        source: parent,
      };
    }
  }

  generateId(type: string, parent?: Reference | ReferencedResource) {
    if (parent && parent instanceof ReferencedResource) {
      parent = parent.ref();
    }

    return `${(parent || this.options.parent?.resource)?.id}/${type}/${randomId()}`;
  }

  ref(idOrRef: string | Reference) {
    let id = "";
    let type = "";

    if (typeof idOrRef === "string") {
      id = idOrRef;
    } else {
      id = idOrRef.id;
      type = idOrRef.type;
    }

    const state = this.vault.getState();
    const realType = state.iiif.mapping[id];

    if (!realType) {
      type = type || "unknown";
    } else {
      type = realType;
    }

    return new ReferencedResource({ id, type }, this.vault);
  }

  embed(data: any) {
    // Load before embedding.
    this.vault.load(data.id, data);
    return new CreatorResource(data, this.vault);
  }

  async create(definition: string, payload: any, options?: Partial<CreatorOptions>) {
    const foundDefinition = this.configs.find((t) => t.id === definition);
    if (!foundDefinition) {
      throw new Error(`Creator config ${definition} not found`);
    }

    const runtime = new CreatorRuntime(this.vault, foundDefinition, payload, this.configs, this.previewVault, options);

    return (await runtime.run()) as any;
  }
}
