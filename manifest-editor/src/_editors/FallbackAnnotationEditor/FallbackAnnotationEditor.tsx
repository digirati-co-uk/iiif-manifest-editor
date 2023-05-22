import { useCanvas, useVault } from "react-iiif-vault";
import { useAnnotationThumbnail } from "@/hooks/useAnnotationThumbnail";
import { InputContainer, InputLabel } from "@/editors/Input";
import { Button, ButtonGroup } from "@/atoms/Button";
import { centerRectangles } from "@/helpers/center-rectangles";
import { BoxSelectorField } from "@/_components/form-elements/BoxSelectorField/BoxSelectorField";
import { FlexContainerColumn, FlexImage } from "@/components/layout/FlexContainer";
import { DeleteButton } from "@/_components/ui/DeleteButton/DeleteButton";
import { AnnotationPreview } from "@/_components/ui/AnnotationPreview/AnnotationPreview";
import { useEditor, useGenericEditor } from "@/shell/EditingStack/EditingStack";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { isImageService } from "@atlas-viewer/iiif-image-api";
import { ImageService } from "@iiif/presentation-3";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";

export function FallbackAnnotationEditor() {
  // This is for an annotation
  const vault = useVault();
  const annotationEditor = useEditor();
  const resourceRef = annotationEditor.annotation.body.getFirst();
  const resourceEditor = useGenericEditor(resourceRef, {
    parentProperty: "body",
    parent: annotationEditor.ref(),
    index: 0,
  });

  const { width, height } = resourceEditor.technical;
  const { service } = resourceEditor.linking;
  const { target } = annotationEditor.annotation;
  const canvasId = target.getSourceId();

  const { edit } = useLayoutActions();

  const thumbnail = useAnnotationThumbnail({ annotationId: annotationEditor.technical.id.get() });
  const canvas = useCanvas({ id: canvasId });

  const serviceList = service.get() || [];
  const currentTarget = target.get();
  const currentSelector = target.getParsedSelector();

  const targetElements = (
    <>
      {canvas && !currentTarget.selector ? (
        <InputContainer wide>
          <InputLabel $margin>Target</InputLabel>
          <div style={{ border: "1px solid #ddd", borderRadius: 3, padding: "1em", color: "#999" }}>
            This annotation fills the whole Canvas.
          </div>
          <ButtonGroup $right>
            <Button
              onClick={() => {
                vault.batch(() => {
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

                  const imagePosition = centerRectangles(
                    canvas,
                    {
                      width: width.get(),
                      height: height.get(),
                    },
                    0.6
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
    <PaddedSidebarContainer>
      {targetElements}

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
    </PaddedSidebarContainer>
  );
}
