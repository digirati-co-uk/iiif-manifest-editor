import { isSpecificResource } from "@iiif/parser";
import { useEditor } from "@manifest-editor/shell";
import { useVault } from "react-iiif-vault";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { resolveFirstAnnotationBody } from "../../helpers/scene-annotation-body";
import {
  getTransformVector,
  setTransformAxis,
  type ModelTransform,
  type TransformAxis,
  type TransformType,
} from "../../helpers/model-transforms";

const fields: Array<{ label: string; type: TransformType; step: number }> = [
  { label: "Position", type: "TranslateTransform", step: 0.1 },
  { label: "Rotation", type: "RotateTransform", step: 1 },
  { label: "Scale", type: "ScaleTransform", step: 0.1 },
];

export function TransformFields() {
  const editor = useEditor();
  const vault = useVault();
  const bodyEditor = editor.annotation.body;
  const rawBody = bodyEditor.get() as any;
  const body = resolveFirstAnnotationBody({ body: rawBody }, vault);
  const wrapper: any = isSpecificResource(body) ? body : { type: "SpecificResource", source: body };
  const transforms = (wrapper.transform || []) as ModelTransform[];

  const update = (type: TransformType, axis: TransformAxis, value: number) => {
    if (!Number.isFinite(value)) return;
    const nextTransforms = setTransformAxis(transforms, type, axis, value);
    if (Array.isArray(rawBody)) {
      bodyEditor.updateReference(0, { ...wrapper, transform: nextTransforms } as any);
    } else if (isSpecificResource(body)) {
      vault.modifyEntityField({ id: body.id, type: "SpecificResource" } as any, "transform", nextTransforms);
    } else {
      const id = `vault://manifest-editor/SpecificResource/${encodeURIComponent(editor.ref().id)}`;
      vault.loadSync(id, {
        id,
        type: "SpecificResource",
        source: body,
        transform: nextTransforms,
      } as any);
      vault.modifyEntityField(editor.ref() as any, "body", { id, type: "ContentResource" });
    }
  };

  return (
    <>
      {fields.map(({ label, type, step }) => {
        const value = getTransformVector(transforms, type);
        return (
          <InputContainer $wide key={type}>
            <InputLabel>{label}</InputLabel>
            <div className="flex gap-2">
              {(["x", "y", "z"] as const).map((axis) => (
                <label className="flex-1 text-xs uppercase" key={axis}>
                  {axis}
                  <Input
                    aria-label={`${label} ${axis}`}
                    type="number"
                    step={step}
                    value={value[axis]}
                    onChange={(event) => update(type, axis, event.target.valueAsNumber)}
                  />
                </label>
              ))}
            </div>
          </InputContainer>
        );
      })}
    </>
  );
}
