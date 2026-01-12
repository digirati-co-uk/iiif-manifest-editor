import type { SupportedSelector } from "@iiif/helpers";
import type { Vault } from "@iiif/helpers/vault";
import type {
  Reference,
  Selector,
  SpecificResource,
} from "@iiif/presentation-3";
import {
  type AnnotationResponse,
  annotationResponseToSelector,
  seraliseSupportedSelector,
} from "react-iiif-vault";
import { CreatorResource } from "./CreatorResource";
import { CreatorRuntime } from "./CreatorRuntime";
import { ReferencedResource } from "./ReferencedResource";
import type {
  CreatorDefinition,
  CreatorFunctionContext,
  CreatorOptions,
} from "./types";
import { randomId } from "./utils";

export class CreatorInstance implements CreatorFunctionContext {
  vault: Vault;
  previewVault: Vault;
  configs: CreatorDefinition[];
  options: CreatorOptions;

  target: CreatorOptions["target"];
  selector: SupportedSelector | undefined | null;
  serialisedSelector: { type: string; value: string } | null = null;

  constructor(
    vault: Vault,
    options: CreatorOptions,
    createConfigs: CreatorDefinition[],
    previewVault: Vault,
  ) {
    this.vault = vault;
    this.previewVault = previewVault;
    this.options = options;
    this.configs = createConfigs;
    this.target = this.options.target || this.options.parent?.resource;
    const response: AnnotationResponse = this.options.initialData?.selector;
    this.selector = response ? annotationResponseToSelector(response) : null;
    if (this.options.initialData?.getSerialisedSelector) {
      this.serialisedSelector =
        this.options.initialData.getSerialisedSelector();
    }
  }

  getPreviewVault() {
    return this.previewVault;
  }

  setSelector(selector: SupportedSelector) {
    this.selector = selector;
  }

  getSerialisedSelector() {
    if (this.serialisedSelector) {
      return this.serialisedSelector;
    }
    const selector = this.selector;
    if (selector) {
      const serialisedSelector = seraliseSupportedSelector(
        selector,
        this.options.initialData?.on,
      );
      if (serialisedSelector) {
        return serialisedSelector;
      }
    }
    return null;
  }

  getTarget(): SpecificResource | Reference | undefined {
    const target = this.target;
    const serialisedSelector = this.getSerialisedSelector();

    if (serialisedSelector) {
      return {
        type: "SpecificResource",
        source: target,
        selector: serialisedSelector as Selector,
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
    if (this.options.rootId) {
      parent = { id: this.options.rootId, type: "none" };
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
    return new CreatorResource(data, this.vault);
  }

  async create(
    definition: string,
    payload: any,
    options?: Partial<CreatorOptions>,
  ) {
    const foundDefinition = this.configs.find((t) => t.id === definition);
    if (!foundDefinition) {
      throw new Error(`Creator config ${definition} not found`);
    }

    const runtime = new CreatorRuntime(
      this.vault,
      foundDefinition,
      payload,
      this.configs,
      this.previewVault,
      options,
    );

    return (await runtime.run()) as any;
  }
}
