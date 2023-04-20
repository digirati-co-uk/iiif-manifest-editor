import invariant from "tiny-invariant";
import { BaseReferenceListEditor } from "./BaseReferenceListEditor";
import { EditorConfig, TrackerState } from "./types";
import { Reference, SpecificResource } from "@iiif/presentation-3";

const emptyTracker: TrackerState = {
  key: "",
  observed: [],
  reset() {},
  start() {
    return () => void 0;
  },
  subscribe() {
    return () => void 0;
  },
  track() {},
};

export class SelfReferenceEditor<T> {
  index: number;
  private editor: BaseReferenceListEditor<T, any>;
  config: EditorConfig;

  constructor(config: EditorConfig) {
    invariant(config.context.parent, "Parent is required");
    invariant(typeof config.context.index !== "undefined", "Parent index is required");
    invariant(config.context.parentProperty, "Parent is required");
    this.editor = new BaseReferenceListEditor(
      {
        ...config,
        reference: config.context.parent,
        tracker: emptyTracker,
        context: { resource: { type: "SpecificResource", source: config.context.parent } },
      },
      config.context.parentProperty
    );
    this.config = config;
    this.index = config.context.index;
  }

  getSelector() {
    const resource = this.config.context.resource;
    if (resource.selector) {
      return resource.selector;
    }
    return null;
  }

  updateReference(reference: Reference | SpecificResource) {
    this.editor.updateReference(this.index, reference);
  }

  moveToStart() {
    this.editor.moveToStart(this.index);
    this.index = 0;
  }

  moveToEnd() {
    this.editor.moveToEnd(this.index);
    this.index = this.editor.getWithoutTracking().length - 1;
  }

  moveUpBy(steps: number) {
    this.editor.moveUpBy(this.index, steps);
    this.index = Math.max(0, this.index - steps);
  }

  moveDownBy(steps: number) {
    this.editor.moveDownBy(this.index, steps);
    this.index = Math.min(this.editor.getWithoutTracking().length + 1, this.index + steps);
  }

  removeFromParent() {
    this.editor.deleteAtIndex(this.index);
  }

  addAfter(reference: Reference | SpecificResource) {
    this.editor.addAfter(this.index, reference);
  }

  addBefore(reference: Reference | SpecificResource) {
    this.editor.addBefore(this.index, reference);
    this.index++;
  }
}
