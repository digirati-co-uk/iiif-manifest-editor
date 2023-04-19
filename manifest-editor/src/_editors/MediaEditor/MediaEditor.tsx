import { useCanvas, useVault } from "react-iiif-vault";
import { useAnnotationThumbnail } from "@/hooks/useAnnotationThumbnail";
import { Input, InputContainer, InputLabel } from "@/editors/Input";
import { DimensionsTriplet } from "@/atoms/DimensionsTriplet";
import { ServiceList } from "@/navigation/ServiceList/ServiceList";
import { Button, ButtonGroup } from "@/atoms/Button";
import { centerRectangles } from "@/helpers/center-rectangles";
import { BoxSelectorField } from "@/_components/form-elements/BoxSelectorField/BoxSelectorField";
import { FlexContainerColumn, FlexImage } from "@/components/layout/FlexContainer";
import { Accordion } from "@/components/layout/Accordion/Accordion";
import { DeleteButton } from "@/_components/ui/DeleteButton/DeleteButton";
import { AnnotationPreview } from "@/_components/ui/AnnotationPreview/AnnotationPreview";
import { useEditor, useGenericEditor } from "@/shell/EditingStack/EditingStack";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { LanguageFieldEditor } from "@/editors/generic/LanguageFieldEditor/LanguageFieldEditor";
import { RichMediaLink } from "@/components/organisms/RichMediaLink/RichMediaLink";
import { parseServiceProfile } from "@/navigation/ServiceList/ServiceList.utility";
import { ServiceContainer } from "@/navigation/ServiceList/ServiceList.styles";

export function MediaEditor() {
  // This is for an annotation
  const annotationEditor = useEditor();
  const resourceRef = annotationEditor.annotation.body.getFirst();
  const resourceEditor = useGenericEditor(resourceRef);

  const { id, width, height, mediaType: type, format, duration } = resourceEditor.technical;
  const { service } = resourceEditor.linking;
  const { label, summary } = annotationEditor.descriptive;
  const { target, body } = annotationEditor.annotation;
  const canvasId = target.getSourceId();

  const { edit } = useLayoutActions();

  const thumbnail = useAnnotationThumbnail({ annotationId: annotationEditor.technical.id.get() });
  const canvas = useCanvas({ id: canvasId });

  const descriptive = (
    <>
      <LanguageFieldEditor
        focusId={label.focusId()}
        label={"Label"}
        fields={label.get()}
        onSave={(e: any) => label.set(e.toInternationalString())}
      />

      <LanguageFieldEditor
        focusId={summary.focusId()}
        label={"Summary"}
        fields={summary.get()}
        onSave={(e: any) => summary.set(e.toInternationalString())}
      />
    </>
  );

  const media = (
    <>
      <InputContainer wide>
        <DimensionsTriplet
          width={width.get() || 0}
          changeWidth={(v) => width.set(v)}
          height={height.get() || 0}
          changeHeight={(v) => height.set(v)}
          duration={duration.get() || 0}
          changeDuration={type.get() !== "Image" ? (v) => duration.set(v) : undefined}
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor={type.focusId()}>
          Type
        </InputLabel>
        <Input
          id={type.focusId()}
          value={type.get()}
          placeholder={"Image, sound etc"}
          onChange={(e: any) => type.set(e.target.value)}
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor={format.focusId()}>
          Format
        </InputLabel>
        <Input
          id={format.focusId()}
          value={format.get()}
          placeholder={"jpg, png etc."}
          onChange={(e: any) => format.set(e.target.value)}
        />
      </InputContainer>
    </>
  );

  const serviceList = service.get();

  const services = serviceList ? (
    <>
      <ServiceContainer>
        <InputLabel>Services</InputLabel>
        {serviceList
          ? serviceList.map((service: any, key) => (
              <RichMediaLink
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  edit(service, { parent: resourceEditor.ref(), property: "service", index: key });
                }}
                link={service.id || service["@id"]}
                title={service.type || service["@type"] || "Unknown service"}
                label={parseServiceProfile(service.profile)}
              />
            ))
          : null}
      </ServiceContainer>
    </>
  ) : null;

  const currentTarget = target.get();
  const currentSelector = target.getParsedSelector();

  const targetElements = (
    <>
      {canvas && !currentTarget.selector ? (
        <InputContainer wide>
          <InputLabel $margin>Target</InputLabel>
          <div style={{ border: "1px solid #ddd", borderRadius: 3, padding: "1em", color: "#999" }}>
            This image fills the whole Canvas.
          </div>
          <ButtonGroup $right>
            <Button
              onClick={() => {
                const imagePosition = centerRectangles(
                  canvas,
                  {
                    width: width.get(),
                    height: height.get(),
                  },
                  0.6
                );

                target.setPosition(imagePosition);
              }}
            >
              Change
            </Button>
          </ButtonGroup>
        </InputContainer>
      ) : null}

      {currentSelector && currentSelector.type === "BoxSelector" ? (
        <InputContainer wide>
          <BoxSelectorField
            selector={currentSelector}
            form
            inlineFieldset
            onSubmit={(data) => {
              target.setPosition(data.spatial);
            }}
          >
            <ButtonGroup $right>
              <Button type="button" onClick={() => target.removeSelector()}>
                Target whole canvas
              </Button>
              <Button type="submit">Update target</Button>
            </ButtonGroup>
          </BoxSelectorField>
        </InputContainer>
      ) : null}
    </>
  );

  return (
    <FlexContainerColumn>
      <FlexImage>{thumbnail ? <img src={thumbnail.id} /> : null}</FlexImage>

      <InputContainer wide>
        <Input disabled value={id.get()} />
      </InputContainer>

      <Accordion
        items={[
          {
            label: "Descriptive",
            initialOpen: Object.keys(label.get() || {}).length !== 0 || Object.keys(summary.get() || {}).length !== 0,
            children: descriptive,
          },
          {
            label: "Media information",
            initialOpen: true,
            children: media,
          },
          {
            label: "Services",
            children: services,
          },
          {
            label: "Target",
            initialOpen: currentSelector !== null,
            children: targetElements,
          },
        ]}
      />

      {annotationEditor.context ? (
        <DeleteButton
          label="Remove from canvas"
          message="Are you sure you want to remove from canvas"
          onDelete={() => {
            annotationEditor.context?.removeFromParent();
            edit(annotationEditor.ref());
          }}
        >
          <FlexImage>{thumbnail ? <img src={thumbnail.id} /> : null}</FlexImage>
          <AnnotationPreview />
        </DeleteButton>
      ) : null}
    </FlexContainerColumn>
  );
}
