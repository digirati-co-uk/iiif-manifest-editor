import { isImageService } from "@atlas-viewer/iiif-image-api";
import type { ImageService } from "@iiif/presentation-3";
import {
  useEditor,
  useGenericEditor,
  useLayoutActions,
} from "@manifest-editor/shell";
import { DeleteButton } from "@manifest-editor/ui/DeleteButton";
import { Accordion } from "@manifest-editor/ui/atoms/Accordion";
import { Button, ButtonGroup } from "@manifest-editor/ui/atoms/Button";
import {
  FlexContainerColumn,
  FlexImage,
} from "@manifest-editor/ui/components/layout/FlexContainer";
import { RichMediaLink } from "@manifest-editor/ui/components/organisms/RichMediaLink/RichMediaLink";
import { useCanvas, useVault } from "react-iiif-vault";
import { AnnotationPreview } from "../../components/AnnotationPreview/AnnotationPreview";
import { DimensionsTriplet } from "../../components/DimensionsTriplet";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { ServiceContainer } from "../../components/ServiceList/ServiceList.styles";
import { parseServiceProfile } from "../../components/ServiceList/ServiceList.utility";
import { BoxSelectorField } from "../../form-elements/BoxSelectorField/BoxSelectorField";
import { centerRectangles } from "../../helpers/center-rectangles";
import { getYouTubeId } from "../../helpers/get-youtube-id";
import { useAnnotationThumbnail } from "../../hooks/useAnnotationThumbnail";

function EmbedYoutube({ youTubeId }: { youTubeId: string }) {
  return (
    <div className="video-container3">
      <style>
        {`
            .video-container3 {
              background: #000;
              z-index: 13;
              display: flex;
              justify-content: center;
              pointer-events: visible;
              height: 250px;
            }
            .video-yt3 {
              border: none;
              width: 100%;
              object-fit: contain;
            }
          `}
      </style>
      <iframe
        className="video-yt3"
        src={`https://www.youtube.com/embed/${youTubeId}?enablejsapi=1&origin=${window.location.host}`}
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      ></iframe>
    </div>
  );
}

export function MediaEditor() {
  // This is for an annotation
  const vault = useVault();
  const annotationEditor = useEditor();
  const resourceRef = annotationEditor.annotation.body.getFirst();
  const resourceEditor = useGenericEditor(resourceRef, {
    parentProperty: "body",
    parent: annotationEditor.ref(),
    index: 0,
  });

  const {
    id,
    width,
    height,
    mediaType: type,
    format,
    duration,
  } = resourceEditor.technical;
  const { service } = resourceEditor.linking;
  const { label, summary } = annotationEditor.descriptive;
  const { target, body } = annotationEditor.annotation;
  const canvasId = target.getSourceId();

  const { edit } = useLayoutActions();

  const thumbnail = useAnnotationThumbnail({
    annotationId: annotationEditor.technical.id.get(),
  });
  const canvas = useCanvas({ id: canvasId });

  //type.get()
  const isYouTube = !!(service.get() || []).find(
    (r) => (r as any).profile === "https://www.youtube.com",
  );
  const youtubeId = isYouTube ? getYouTubeId(id.get()) : null;

  // VideoYouTubeHTML

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
      <InputContainer $wide>
        <DimensionsTriplet
          width={width.get() || 0}
          changeWidth={(v) => width.set(v)}
          height={height.get() || 0}
          changeHeight={(v) => height.set(v)}
          duration={duration.get() || 0}
          changeDuration={
            type.get() !== "Image" ? (v) => duration.set(v) : undefined
          }
        />
      </InputContainer>

      <InputContainer $wide>
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

      <InputContainer $wide>
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

  const serviceList = service.get() || [];

  const services = serviceList.length ? (
    <>
      <ServiceContainer>
        <InputLabel>Services</InputLabel>
        {serviceList.map((service: any, key) => (
          <RichMediaLink
            key={key}
            onClick={(e) => {
              e.preventDefault();
              // edit(service, { parent: resourceEditor.ref(), property: "service", index: key });
            }}
            link={service.id || service["@id"]}
            title={service.type || service["@type"] || "Unknown service"}
            label={parseServiceProfile(service.profile)}
          />
        ))}
      </ServiceContainer>
    </>
  ) : null;

  const currentTarget = target.get();
  const currentSelector = target.getParsedSelector();

  const targetElements = (
    <>
      {canvas && !currentTarget.selector ? (
        <InputContainer $wide>
          <InputLabel $margin>Target</InputLabel>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: 3,
              padding: "1em",
              color: "#999",
            }}
          >
            This image fills the whole Canvas.
          </div>
          <ButtonGroup $right>
            <Button
              onClick={() => {
                vault.batch(() => {
                  let dimensionsSet = false;

                  // However.. if it's cropped this won't work.
                  if (body.hasIIIFSelector()) {
                    const dimensions = body.getIIIFSelectorHeightWidth();
                    if (dimensions) {
                      dimensionsSet = true;
                      if (dimensions.width !== width.get()) {
                        width.set(dimensions.width);
                      }
                      if (dimensions.height !== height.get()) {
                        height.set(dimensions.height);
                      }

                      const imagePosition = centerRectangles(
                        canvas,
                        {
                          width: dimensions.width,
                          height: dimensions.height,
                        },
                        0.6,
                      );

                      target.setPosition(imagePosition);

                      return;
                    }
                  }

                  if (!dimensionsSet) {
                    // Check image resource width/height vs. service.
                    const imageService = serviceList.find((s) =>
                      isImageService(s),
                    ) as ImageService | undefined;
                    if (imageService) {
                      if (imageService.width && imageService.height) {
                        if (imageService.width !== width.get()) {
                          width.set(imageService.width);
                        }
                        if (imageService.height !== height.get()) {
                          height.set(imageService.height);
                        }
                      }
                    }
                  }

                  const imagePosition = centerRectangles(
                    canvas,
                    {
                      width: width.get(),
                      height: height.get(),
                    },
                    0.6,
                  );

                  target.setPosition(imagePosition);
                });
              }}
            >
              Change
            </Button>
          </ButtonGroup>
        </InputContainer>
      ) : null}
      {currentSelector && currentSelector.type === "BoxSelector" ? (
        <InputContainer $wide>
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
      <FlexImage>
        {thumbnail ? (
          <img src={thumbnail.id} />
        ) : youtubeId ? (
          <EmbedYoutube youTubeId={youtubeId} />
        ) : null}
      </FlexImage>

      <InputContainer $wide>
        <Input disabled value={id.get()} />
      </InputContainer>

      <Accordion
        items={[
          {
            label: "Descriptive",
            initialOpen:
              Object.keys(label.get() || {}).length !== 0 ||
              Object.keys(summary.get() || {}).length !== 0,
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
