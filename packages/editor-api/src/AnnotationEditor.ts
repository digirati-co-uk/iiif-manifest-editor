import { BaseEditor } from "./BaseEditor";
import { AnnotationNormalized } from "@iiif/parser/presentation-4-normalized/types";
import { EditorConfig } from "./types";
import { AnnotationTargetEditor } from "./AnnotationTargetEditor";
import { AnnotationBodyEditor } from "./AnnotationBodyEditor";

export class AnnotationEditor extends BaseEditor<AnnotationNormalized> {
  target: AnnotationTargetEditor;
  body: AnnotationBodyEditor;
  constructor(config: EditorConfig) {
    super(config);

    this.target = new AnnotationTargetEditor(config);
    this.body = new AnnotationBodyEditor(config);
  }
}
