import { BehaviorEditor } from "@/_components/editors/BehaviorEditor/BehaviorEditor";
import { InlineSelect } from "@/_components/form-elements/InlineSelect/InlineSelect";
import { DimensionsTriplet } from "@/atoms/DimensionsTriplet";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel, Input } from "@/editors/Input";
import { useEditor } from "@/shell/EditingStack/EditingStack";
import { ViewingDirection } from "@iiif/presentation-3";
import { TextGranularityEditor } from "@/_components/editors/TextGranularityEditor/TextGranularityEditor";

export function TechnicalProperties() {
  const { technical, extensions, notAllowed } = useEditor();
  const { id, viewingDirection, height, width, duration, behavior, format, motivation, profile, timeMode } = technical;

  return (
    <>
      <PaddedSidebarContainer>
        <InputContainer wide id={id.containerId()}>
          <InputLabel htmlFor={id.focusId()}>Identifier</InputLabel>
          <Input disabled id={id.focusId()} value={id.get()} />
        </InputContainer>

        {!notAllowed.includes("width") && !notAllowed.includes("height") ? (
          <InputContainer wide>
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
          </InputContainer>
        ) : null}

        {!notAllowed.includes("viewingDirection") ? (
          <InputContainer fluid id={viewingDirection.containerId()}>
            <InputLabel htmlFor={viewingDirection.focusId()}>Viewing direction</InputLabel>
            <InlineSelect
              id={viewingDirection.focusId()}
              name="viewingDirection"
              value={viewingDirection.get()}
              onChange={(newValue) => viewingDirection.set(newValue as ViewingDirection)}
              options={[
                {
                  label: { en: ["Left to right"] },
                  value: "left-to-right",
                },
                {
                  label: { en: ["Right to left"] },
                  value: "right-to-left",
                },
                {
                  label: { en: ["Top to bottom"] },
                  value: "top-to-bottom",
                },
                {
                  label: { en: ["Bottom to top"] },
                  value: "bottom-to-top",
                },
              ]}
            />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("profile") ? (
          <InputContainer wide id={profile.containerId()}>
            <InputLabel htmlFor={profile.focusId()}>Profile</InputLabel>
            <Input id={profile.focusId()} value={profile.get()} onChange={(e) => profile.set(e.target.value)} />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("timeMode") ? (
          <InputContainer wide id={timeMode.containerId()}>
            <InputLabel htmlFor={timeMode.focusId()}>Time mode</InputLabel>
            <InlineSelect
              value={timeMode.get() || ""}
              options={[
                { label: { en: ["None"] }, value: "" },
                { label: { en: ["Trim"] }, value: "trim" },
                { label: { en: ["Scale"] }, value: "scale" },
                { label: { en: ["Loop"] }, value: "loop" },
              ]}
              id={timeMode.focusId()}
              onChange={(value) => timeMode.set(value || null)}
              onDeselect={() => timeMode.set(null)}
            />
          </InputContainer>
        ) : null}

        {!notAllowed.includes("format") ? (
          <InputContainer wide id={format.containerId()}>
            <InputLabel htmlFor={format.focusId()}>Format</InputLabel>
            <Input
              id={format.focusId()}
              value={format.get()}
              placeholder={"jpg, png etc."}
              onChange={(e: any) => format.set(e.target.value)}
            />
          </InputContainer>
        ) : null}

        {/* @todo this should be smarted based on the context. */}
        {!notAllowed.includes("motivation") ? (
          <InputContainer wide id={motivation.containerId()}>
            <InputLabel htmlFor={motivation.focusId()}>Motivation</InputLabel>
            <Input
              id={motivation.focusId()}
              value={motivation.get() || ""}
              placeholder={"painting, supplementing etc."}
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
