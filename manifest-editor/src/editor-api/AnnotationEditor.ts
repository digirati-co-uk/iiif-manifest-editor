import { BaseEditor } from "@/editor-api/BaseEditor";
import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { EditorConfig } from "@/editor-api/types";
import { AnnotationTargetEditor } from "@/editor-api/AnnotationTargetEditor";
import { AnnotationBodyEditor } from "@/editor-api/AnnotationBodyEditor";

export class AnnotationEditor extends BaseEditor<AnnotationNormalized> {
  target: AnnotationTargetEditor;
  body: AnnotationBodyEditor;
  constructor(config: EditorConfig) {
    super(config);

    this.target = new AnnotationTargetEditor(config);
    this.body = new AnnotationBodyEditor(config);
  }
}
