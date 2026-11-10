import { propertyLabels } from "@manifest-editor/editor-api";
import { useDisplayLabel } from "../../i18n";
import { useTranslations } from "@manifest-editor/i18n";
import { CanvasContext } from "react-iiif-vault";
import { SmartCanvasSize } from "../../components/CanvasLayout/SmartCanvasSize";
import type { ViewingDirection } from "@iiif/presentation-3";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useEditor } from "@manifest-editor/shell";
import { BehaviorEditor } from "../../components/BehaviorEditor/BehaviorEditor";
import { DimensionsTriplet } from "../../components/DimensionsTriplet";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { InlineSelect } from "../../form-elements/InlineSelect/InlineSelect";

export function TechnicalProperties() {
  const t = useTranslations("editors");
  const apiLabel = useDisplayLabel();
  const { technical, notAllowed } = useEditor();
  const { id, viewingDirection, height, width, duration, behavior, format, motivation, profile, timeMode } = technical;

  return (
    <>
      <PaddedSidebarContainer>
        <InputContainer $wide id={id.containerId()}>
          <InputLabel htmlFor={id.focusId()}>{apiLabel(propertyLabels.id)!}</InputLabel>
          <Input disabled id={id.focusId()} value={id.get()} />
        </InputContainer>

        {!notAllowed.includes("width") && !notAllowed.includes("height") ? (
          <InputContainer $wide>
            {technical.type === "Canvas" ? (
              <CanvasContext canvas={id.get()}>
                <SmartCanvasSize
                  fallback={
                    <DimensionsTriplet
                      widthId={width.containerId()}
                      width={width.get() || 0}
                      changeWidth={(value) => width.set(value)}
                      heightId={height.containerId()}
                      height={height.get() || 0}
                      changeHeight={(value) => height.set(value)}
                    />
                  }
                />
              </CanvasContext>
            ) : (
              <DimensionsTriplet
                widthId={width.containerId()}
                width={width.get() || 0}
                changeWidth={(v) => width.set(v)}
                heightId={height.containerId()}
                height={height.get() || 0}
                changeHeight={(v) => height.set(v)}
                durationId={duration.containerId()}
                duration={duration.get() || 0}
                changeDuration={(v) => duration.set(v)}
              />
            )}
            {technical.type === "Canvas" && !notAllowed.includes("duration") && (
              <label htmlFor={duration.focusId()} className="mt-3 block text-sm">
                {t("ui.durationSeconds")}
                <Input
                  id={duration.focusId()}
                  type="number"
                  min={0}
                  step="any"
                  value={duration.get() || 0}
                  onChange={(e) => duration.set(Number(e.target.value))}
                />
              </label>
            )}
          </InputContainer>
        ) : null}

        {!notAllowed.includes("viewingDirection") ? (
          <InputContainer $fluid id={viewingDirection.containerId()}>
            <InputLabel htmlFor={viewingDirection.focusId()}>{apiLabel(propertyLabels.viewingDirection)!}</InputLabel>
            <InlineSelect
              id={viewingDirection.focusId()}
              name="viewingDirection"
              value={viewingDirection.get()}
              onChange={(newValue) => viewingDirection.set(newValue as ViewingDirection)}
              options={[
                {
                  label: { en: [t("ui.leftToRight")] },
                  value: "left-to-right",
                },
                {
                  label: { en: [t("ui.rightToLeft")] },
                  value: "right-to-left",
                },
                {
                  label: { en: [t("ui.topToBottom")] },
                  value: "top-to-bottom",
                },
                {
                  label: { en: [t("ui.bottomToTop")] },
                  value: "bottom-to-top",
                },
              ]}
            />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("profile") ? (
          <InputContainer $wide id={profile.containerId()}>
            <InputLabel htmlFor={profile.focusId()}>{apiLabel(propertyLabels.profile)!}</InputLabel>
            <Input id={profile.focusId()} value={profile.get()} onChange={(e) => profile.set(e.target.value)} />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("timeMode") ? (
          <InputContainer $wide id={timeMode.containerId()}>
            <InputLabel htmlFor={timeMode.focusId()}>{apiLabel(propertyLabels.timeMode)!}</InputLabel>
            <InlineSelect
              value={timeMode.get() || ""}
              options={[
                { label: { en: [t("ui.none")] }, value: "" },
                { label: { en: [t("ui.trim")] }, value: "trim" },
                { label: { en: [t("ui.scale")] }, value: "scale" },
                { label: { en: [t("ui.loop")] }, value: "loop" },
              ]}
              id={timeMode.focusId()}
              onChange={(value) => timeMode.set(value || null)}
              onDeselect={() => timeMode.set(null)}
            />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("format") ? (
          <InputContainer $wide id={format.containerId()}>
            <InputLabel htmlFor={format.focusId()}>{apiLabel(propertyLabels.format)!}</InputLabel>
            <Input
              id={format.focusId()}
              value={format.get()}
              placeholder={t("ui.jpgPngEtc")}
              onChange={(e: any) => format.set(e.target.value)}
            />
          </InputContainer>
        ) : null}

        {/* @todo this should be smarted based on the context. */}
        {!notAllowed.includes("motivation") ? (
          <InputContainer $wide id={motivation.containerId()}>
            <InputLabel htmlFor={motivation.focusId()}>{apiLabel(propertyLabels.motivation)!}</InputLabel>
            <Input
              id={motivation.focusId()}
              value={motivation.get() || ""}
              placeholder={t("ui.paintingSupplementingEtc")}
              onChange={(e: any) => motivation.set(e.target.value)}
            />
          </InputContainer>
        ) : null}
      </PaddedSidebarContainer>

      {!notAllowed.includes("behavior") ? (
        <BehaviorEditor
          id={behavior.containerId()}
          behavior={behavior.get() || []}
          onChange={(e) => behavior.set(e)}
          configs={behavior.getSupported()}
        />
      ) : null}
    </>
  );
}
