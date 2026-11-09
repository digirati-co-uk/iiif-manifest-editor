import { EditorI18nBoundary } from "../EditorI18nBridge";
import { useEditorsI18nInstance } from "../../editor-i18n-context";
import { useTranslations } from "@manifest-editor/i18n";
import { useState } from "react";
import { PolygonSelector } from "react-iiif-vault";
import { InputShape } from "polygon-editor";
import { ConfirmSelectionButton, SvgControlBar } from "@manifest-editor/components";

export function DrawPolygon({ onCreate }: { onCreate: (polygon: InputShape) => void }) {
  const t = useTranslations("editors");
  const i18n = useEditorsI18nInstance();
  const [shape, setShape] = useState<InputShape>({ open: true, points: [] });

  return (
    <PolygonSelector
      id="new-polygon"
      updatePolygon={setShape}
      polygon={shape}
      annotationBucket="default"
      renderControls={(helper, state, showShapes) => (
        <>
          <EditorI18nBoundary instance={i18n}>
            <SvgControlBar helper={helper} state={state} showShapes={showShapes} />
          </EditorI18nBoundary>
          <div>
            <ConfirmSelectionButton
              onPress={() => {
                onCreate(shape);
                setShape({ open: true, points: [] });
              }}
            >
              {t("ui.confirmSelection")}
            </ConfirmSelectionButton>
          </div>
        </>
      )}
    />
  );
}
