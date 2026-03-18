import { isImageService } from "@atlas-viewer/iiif-image-api";
import type { ImageService } from "@iiif/presentation-3";
import { useCustomContextMenu, useEditor, useGenericEditor, useLayoutActions } from "@manifest-editor/shell";
import { Accordion } from "@manifest-editor/ui/atoms/Accordion";
import { Button, ButtonGroup } from "@manifest-editor/ui/atoms/Button";
import { FlexContainerColumn, FlexImage } from "@manifest-editor/ui/components/layout/FlexContainer";
import { RichMediaLink } from "@manifest-editor/ui/components/organisms/RichMediaLink/RichMediaLink";
import { DeleteButton } from "@manifest-editor/ui/DeleteButton";
import type { ReactNode } from "react";
import { useCanvas, useVault } from "react-iiif-vault";
import { AnnotationPreview } from "../../components/AnnotationPreview/AnnotationPreview";
import { DimensionsTriplet } from "../../components/DimensionsTriplet";
import { Input, InputContainer, InputLabel } from "../../components/Input";
import { LanguageFieldEditor } from "../../components/LanguageFieldEditor/LanguageFieldEditor";
import { ServiceContainer } from "../../components/ServiceList/ServiceList.styles";
import { parseServiceProfile } from "../../components/ServiceList/ServiceList.utility";
import { centerRectangles } from "../../helpers/center-rectangles";
import { getYouTubeId } from "../../helpers/get-youtube-id";
import { useAnnotationThumbnail } from "../../hooks/useAnnotationThumbnail";
import { MediaTargetEditor } from "./MediaTargetEditor";

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
        title="YouTube video player"
        className="video-yt3"
        src={`https://www.youtube.com/embed/${youTubeId}?enablejsapi=1&origin=${window.location.host}&modestbranding=1&rel=0`}
        // @ts-expect-error
        referrerPolicy="no-referrer compute-pressure"
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

  const { id, width, height, mediaType: type, format, duration } = resourceEditor.technical;
  const { service } = resourceEditor.linking;
  const { label, summary } = annotationEditor.descriptive;
  const { target, body } = annotationEditor.annotation;
  const annotationNotAllowed = annotationEditor.notAllowed;
  const resourceNotAllowed = resourceEditor.notAllowed;
  const canvasId = target.getSourceId();

  const { edit } = useLayoutActions();

  const thumbnail = useAnnotationThumbnail({
    annotationId: annotationEditor.technical.id.get(),
  });
  const canvas = useCanvas({ id: canvasId });

  //type.get()
  const isYouTube = !!(service.get() || []).find((r) => (r as any).profile === "https://www.youtube.com");
  const youtubeId = isYouTube ? getYouTubeId(id.get()) : null;
  const currentTarget = target.get();
  const currentSelector = target.getParsedSelector();
  const showDescriptive =
    !annotationNotAllowed.includes("label") ||
    !annotationNotAllowed.includes("summary");
  const showMediaDetails =
    !resourceNotAllowed.includes("height") ||
    !resourceNotAllowed.includes("width") ||
    !resourceNotAllowed.includes("duration") ||
    !resourceNotAllowed.includes("type") ||
    !resourceNotAllowed.includes("format");
  const showServices = !resourceNotAllowed.includes("service");
  const showTarget = !annotationNotAllowed.includes("target");

  const moveAndResizeImage = () => {
    vault.batch(() => {
      if (!canvas) {
        return;
      }
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
        const imageService = serviceList.find((s) => isImageService(s)) as ImageService | undefined;
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
  };

  useCustomContextMenu(
    {
      sectionTitle: "Painting annotation",
      resource: annotationEditor.ref(),
      items: currentTarget?.selector
        ? []
        : [
            {
              id: "target-region",
              label: "Target specific region",
              onAction: moveAndResizeImage,
            },
          ],
    },
    [currentTarget?.selector],
  );

  // VideoYouTubeHTML

  const descriptive = (
    <>
      {!annotationNotAllowed.includes("label") ? (
        <LanguageFieldEditor
          focusId={label.focusId()}
          label={"Label"}
          fields={label.get()}
          onSave={(e: any) => label.set(e.toInternationalString())}
        />
      ) : null}

      {!annotationNotAllowed.includes("summary") ? (
        <LanguageFieldEditor
          focusId={summary.focusId()}
          label={"Summary"}
          fields={summary.get()}
          onSave={(e: any) => summary.set(e.toInternationalString())}
        />
      ) : null}
    </>
  );

  const media = (
    <>
      {!resourceNotAllowed.includes("width") ||
      !resourceNotAllowed.includes("height") ||
      !resourceNotAllowed.includes("duration") ? (
        <InputContainer $wide>
          <DimensionsTriplet
            hideWidth={resourceNotAllowed.includes("width")}
            width={width.get() || 0}
            changeWidth={
              !resourceNotAllowed.includes("width")
                ? (v) => width.set(v)
                : undefined
            }
            hideHeight={resourceNotAllowed.includes("height")}
            height={height.get() || 0}
            changeHeight={
              !resourceNotAllowed.includes("height")
                ? (v) => height.set(v)
                : undefined
            }
            hideDuration={resourceNotAllowed.includes("duration")}
            duration={
              !resourceNotAllowed.includes("duration")
                ? duration.get() || 0
                : undefined
            }
            changeDuration={
              !resourceNotAllowed.includes("duration") && type.get() !== "Image"
                ? (v) => duration.set(v)
                : undefined
            }
          />
        </InputContainer>
      ) : null}

      {!resourceNotAllowed.includes("type") ? (
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
      ) : null}

      {!resourceNotAllowed.includes("format") ? (
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
      ) : null}
    </>
  );

  const serviceList = service.get() || [];

  const services = showServices && serviceList.length ? (
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

  const targetElements = showTarget ? (
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
            <Button onClick={moveAndResizeImage}>Change</Button>
          </ButtonGroup>
        </InputContainer>
      ) : null}
      {currentSelector && currentSelector.type === "BoxSelector" ? <MediaTargetEditor /> : null}
    </>
  ) : null;

  return (
    <FlexContainerColumn>
      <FlexImage>
        {thumbnail ? <img src={thumbnail.id} /> : youtubeId ? <EmbedYoutube youTubeId={youtubeId} /> : null}
      </FlexImage>

      {!resourceNotAllowed.includes("id") ? (
        <InputContainer $wide>
          <Input disabled value={id.get()} />
        </InputContainer>
      ) : null}

      <Accordion
        items={[
          showDescriptive
            ? {
                label: "Descriptive",
                initialOpen:
                  Object.keys(label.get() || {}).length !== 0 ||
                  Object.keys(summary.get() || {}).length !== 0,
                children: descriptive,
              }
            : null,
          showMediaDetails
            ? {
                label: "Media information",
                initialOpen: true,
                children: media,
              }
            : null,
          showServices && services
            ? {
                label: "Services",
                children: services,
              }
            : null,
          showTarget && targetElements
            ? {
                label: "Target",
                initialOpen: currentSelector !== null,
                children: targetElements,
              }
            : null,
        ].filter(Boolean) as Array<{
          label: string;
          initialOpen?: boolean;
          children: ReactNode;
        }>}
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
