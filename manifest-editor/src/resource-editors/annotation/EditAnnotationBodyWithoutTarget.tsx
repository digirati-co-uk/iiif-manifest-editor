import { useContentResource } from "@/hooks/useContentResource";
import { SupportedTarget, useAnnotation, useCanvas, useVault } from "react-iiif-vault";
import { FlexContainerColumn, FlexImage } from "@/components/layout/FlexContainer";
import { Input, InputContainer, InputLabel } from "@/editors/Input";
import { DimensionsTriplet } from "@/atoms/DimensionsTriplet";
import { ServiceList } from "@/navigation/ServiceList/ServiceList";
import { BoxSelectorField } from "@/_components/form-elements/BoxSelectorField/BoxSelectorField";
import { AnnotationNormalized } from "@iiif/presentation-3";
import { Button, ButtonGroup } from "@/atoms/Button";
import { updateAnnotationSelector } from "@/helpers/update-annotation-selector";
import { centerRectangles } from "@/helpers/center-rectangles";
import { useAnnotationThumbnail } from "@/hooks/useAnnotationThumbnail";
import { DeleteButton } from "@/_components/ui/DeleteButton/DeleteButton";
import { AnnotationPreview } from "@/_components/ui/AnnotationPreview/AnnotationPreview";
import { removeAnnotationFromCanvas } from "@/helpers/remove-annotation-from-canvas";

export function EditAnnotationBodyWithoutTarget(props: { id: string; onAfterDelete?: () => void }) {
  const annotation = useAnnotation<AnnotationNormalized & { target: SupportedTarget }>();
  const resource = useContentResource<any>({ id: props.id });
  const thumbnail = useAnnotationThumbnail();
  const vault = useVault();
  const canvas = useCanvas();

  function setValue(prop: string, value: any) {
    if (resource) {
      vault.modifyEntityField({ id: resource.id, type: "ContentResource" }, prop, value);
    }
  }

  if (!resource) {
    return <div>Resource not found</div>;
  }

  return (
    <FlexContainerColumn>
      <FlexImage>{thumbnail ? <img src={thumbnail.id} /> : null}</FlexImage>

      <InputContainer wide>
        <Input disabled value={resource.id} placeholder={"Paste URL of Media"} />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin>Media Dimensions</InputLabel>
        <DimensionsTriplet
          width={resource.width || 0}
          changeWidth={(w) => setValue("width", w)}
          height={resource.height || 0}
          changeHeight={(w) => setValue("height", w)}
          duration={resource.duration || 0}
          changeDuration={(w) => setValue("duration", w)}
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor="type">
          Type
        </InputLabel>
        <Input
          id="type"
          value={resource.type}
          placeholder={"Image, sound etc"}
          onChange={(e: any) => setValue("type", e.target.value)}
        />
      </InputContainer>

      <InputContainer wide>
        <InputLabel $margin htmlFor="format">
          Format
        </InputLabel>
        <Input
          id="format"
          value={resource.format}
          placeholder={"jpg, png etc."}
          onChange={(e: any) => setValue("format", e.target.value)}
        />
      </InputContainer>

      {resource.service ? <ServiceList resourceId={props.id} services={resource.service} /> : null}

      {annotation && canvas && annotation.target.selector === null ? (
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
                    width: resource.width,
                    height: resource.height,
                  },
                  0.6
                );

                updateAnnotationSelector(vault, annotation, canvas, { type: "BoxSelector", spatial: imagePosition });
              }}
            >
              Change
            </Button>
          </ButtonGroup>
        </InputContainer>
      ) : null}

      {annotation ? (
        annotation.target.selector && annotation.target.selector.type === "BoxSelector" ? (
          <InputContainer wide>
            <InputLabel $margin htmlFor="box-selector-fieldset">
              Target
            </InputLabel>
            <BoxSelectorField
              selector={annotation.target.selector}
              form
              onSubmit={(data) => {
                updateAnnotationSelector(vault, annotation, annotation.target.source, data);
              }}
            >
              <ButtonGroup $right>
                <Button
                  type="button"
                  onClick={() => updateAnnotationSelector(vault, annotation, annotation.target.source)}
                >
                  Target whole canvas
                </Button>
                <Button type="submit">Update target</Button>
              </ButtonGroup>
            </BoxSelectorField>
          </InputContainer>
        ) : null
      ) : null}

      {canvas && annotation ? (
        <DeleteButton
          label="Remove from canvas"
          message="Are you sure you want to remove from canvas"
          onDelete={() => {
            removeAnnotationFromCanvas(vault, canvas, annotation);
            if (props.onAfterDelete) {
              props.onAfterDelete();
            }
          }}
        >
          <FlexImage>{thumbnail ? <img src={thumbnail.id} /> : null}</FlexImage>
          <AnnotationPreview />
        </DeleteButton>
      ) : null}
    </FlexContainerColumn>
  );
}
