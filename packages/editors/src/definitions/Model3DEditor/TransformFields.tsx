import { useEditor } from "@manifest-editor/shell";
import { useState } from "react";
import { useVault } from "react-iiif-vault";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { resolveFirstAnnotationBody, setAnnotationBodyTransforms } from "../../helpers/scene-annotation-body";
import {
  getTransformVector,
  setTransformAxis,
  setTransformVector,
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
  const [uniformScale, setUniformScale] = useState(true);
  const bodyEditor = editor.annotation.body;
  const rawBody = bodyEditor.get() as any;
  const body = resolveFirstAnnotationBody({ body: rawBody }, vault);
  const wrapper: any = body?.type === "SpecificResource" ? body : { type: "SpecificResource", source: body };
  const transforms = (wrapper.transform || []) as ModelTransform[];

  const update = (type: TransformType, axis: TransformAxis, value: number) => {
    if (!Number.isFinite(value)) return;
    const nextTransforms =
      type === "ScaleTransform" && uniformScale
        ? setTransformVector(transforms, type, { x: value, y: value, z: value })
        : setTransformAxis(transforms, type, axis, value);
    setAnnotationBodyTransforms(editor.ref() as any, nextTransforms, vault as any);
  };

  return (
    <>
      {fields.map(({ label, type, step }) => {
        const value = getTransformVector(transforms, type);
        return (
          <InputContainer $wide key={type}>
            <div className="flex items-center justify-between">
              <InputLabel>{label}</InputLabel>
              <button
                className="text-xs text-gray-500 hover:text-gray-900"
                type="button"
                onClick={() =>
                  setAnnotationBodyTransforms(
                    editor.ref() as any,
                    transforms.filter((transform) => transform.type !== type),
                    vault as any
                  )
                }
              >
                Reset
              </button>
            </div>
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
            {type === "ScaleTransform" ? (
              <label className="mt-2 flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={uniformScale}
                  onChange={(event) => setUniformScale(event.target.checked)}
                />
                Uniform scale
              </label>
            ) : null}
          </InputContainer>
        );
      })}
    </>
  );
}
