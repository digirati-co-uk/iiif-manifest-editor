import { useCanvas, useVault } from "react-iiif-vault";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { Button, SecondaryButton } from "../../atoms/Button";
import { FlexContainerRow } from "../../components/layout/FlexContainer";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../atoms/PaddingComponent";
import { useEffect, useState } from "react";
import { NewAnnotationPageForm } from "../../components/organisms/Annotation/NewAnnotationPageForm";

import { AnnotationPages } from "../../components/organisms/Annotation/AnnotationPages";

export const AnnotationForm = () => {
  const canvas = useCanvas();
  const vault = useVault();

  const [showNewAnnotationPage, setShowNewAnnotationPage] = useState(false);

  const guidanceReference = "https://iiif.io/api/presentation/3.0/#annotations";

  function annoPages() {
    // @ts-ignore
    if (vault.get(canvas?.annotations).length === 0) {
      return (
        <small>
          <i>
            This canvas has no annotations yet. You can either link to an existing external Annotation Page, or create a
            new Annotation Page to hold your annotations within this Manifest.
          </i>
          <PaddingComponentMedium />
          <FlexContainerRow justify="flex-end">
            <SecondaryButton onClick={() => setShowNewAnnotationPage(true)}>Create an annotation page</SecondaryButton>
          </FlexContainerRow>
        </small>
      );
    }
    return <AnnotationPages canvasID={canvas.id} />;
  }
  return (
    <>
      <EmptyProperty label={"annotations"} guidanceReference={guidanceReference} />
      {!showNewAnnotationPage && annoPages()}
      {showNewAnnotationPage && (
        <NewAnnotationPageForm
          goBack={() => {
            setShowNewAnnotationPage(false);
          }}
        />
      )}
      <PaddingComponentSmall />
      {
        // @ts-ignore
        !showNewAnnotationPage && vault.get(canvas?.annotations).length !== 0 && (
          <FlexContainerRow justify="flex-end">
            <SecondaryButton onClick={() => setShowNewAnnotationPage(true)}>
              Add another annotation page
            </SecondaryButton>
          </FlexContainerRow>
        )
      }
    </>
  );
};
