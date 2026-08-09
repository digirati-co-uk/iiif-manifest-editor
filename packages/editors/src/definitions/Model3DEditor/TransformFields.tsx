import { isSpecificResource } from "@iiif/parser";
import { useEditor } from "@manifest-editor/shell";
import { Input, InputContainer, InputLabel } from "../../components/Input";
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
  const bodyEditor = editor.annotation.body;
  const body = bodyEditor.getFirst() as any;
  const wrapper: any = isSpecificResource(body) ? body : { type: "SpecificResource", source: body };
  const transforms = (wrapper.transform || []) as ModelTransform[];

  const update = (type: TransformType, axis: TransformAxis, value: number) => {
    if (!Number.isFinite(value)) return;
    bodyEditor.updateReference(0, {
      ...wrapper,
      transform: setTransformAxis(transforms, type, axis, value),
    } as any);
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
