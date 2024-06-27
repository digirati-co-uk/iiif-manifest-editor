import { useState } from "react";
import { PolygonSelector, RenderSvgEditorControls } from "react-iiif-vault";
import { InputShape } from "polygon-editor";
import { ConfirmSelectionButton, SvgControlBar } from "@manifest-editor/components";

export function DrawPolygon({ onCreate }: { onCreate: (polygon: InputShape) => void }) {
  const [shape, setShape] = useState<InputShape>({ open: true, points: [] });

  return (
    <PolygonSelector
      id="new-polygon"
      updatePolygon={setShape}
      polygon={shape}
      annotationBucket="default"
      renderControls={(helper, state, showShapes) => (
        <>
          <SvgControlBar helper={helper} state={state} showShapes={showShapes} />
          <div>
            <ConfirmSelectionButton
              onPress={() => {
                onCreate(shape);
                setShape({ open: true, points: [] });
              }}
            >
              Confirm Selection
            </ConfirmSelectionButton>
          </div>
        </>
      )}
    />
  );
}
