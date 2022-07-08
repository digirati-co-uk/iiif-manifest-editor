import { getValue } from "@iiif/vault-helpers";
import { useVault, useCanvas } from "react-iiif-vault";
import { Button, CalltoButton } from "../../../atoms/Button";
import { LightBox } from "../../../atoms/LightBox";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { useAnnotationList } from "../../../hooks/useAnnotationsList";
import { CloseIcon } from "../../../icons/CloseIcon";
import { FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";
import { Accordian } from "../Accordian/Accordian";
import { AnnotationItems } from "./AnnotationItems";
import { AnnotationPage } from "./AnnotationPage";

export const AnnotationPages: React.FC<{ canvasID: string }> = ({ canvasID }) => {
  const vault = useVault();
  const canvas = useCanvas({ id: canvasID });
  const { addNewAnnotation, removeAnnotationPage } = useAnnotationList(canvasID);

  function items(item: any) {
    return <AnnotationItems pageID={item.id} />;
  }

  function convert(item: any) {
    // @todo we are loosing the detail from the annotationPage here
    vault.load(item.id);
  }

  function externalConvert(annotationPage: any) {
    return (
      <LightBox>
        <PaddingComponentSmall>
          <FlexContainerColumn>
            <h3 style={{ margin: "0.5rem" }}>{getValue(annotationPage.label)}</h3>
            <p>AnnotationPage</p>
            <small>
              <a style={{ color: "unset" }} href={annotationPage.id} target="_blank" rel="noopener noreferrer">
                {annotationPage.id}
              </a>
              <PaddingComponentSmall />
            </small>
            <br />
            <small>
              <i>
                This annotation page has no items, either create a new annotation or make this page part of this
                manifest, for editing.
              </i>
            </small>
            <PaddingComponentSmall />
            <FlexContainerRow>
              <CalltoButton onClick={() => convert(annotationPage)}>Convert to internal AnnotationPage</CalltoButton>
            </FlexContainerRow>
          </FlexContainerColumn>
        </PaddingComponentSmall>
      </LightBox>
    );
  }

  function isExternal(item: any) {
    // @ts-ignore
    return vault.get(item)?.items.length === 0;
  }
  return (
    <>
      {vault.get(canvas.annotations).map((page: any) => {
        if (!page) return <></>;
        return (
          <LightBox key={page.id}>
            <FlexContainerRow justify="flex-end">
              <Button title="delete" onClick={() => removeAnnotationPage(page.id)}>
                <CloseIcon />
              </Button>
            </FlexContainerRow>
            <Accordian renderOpen={false} title={getValue(page.label) || "Annotation Page Properties"}>
              <AnnotationPage id={page.id} />
            </Accordian>
            <PaddingComponentMedium />
            {isExternal(page) && externalConvert(page)}
            <Accordian renderOpen={false} title="items">
              <PaddingComponentMedium>{items(page)}</PaddingComponentMedium>
              {page.items.length === 0 && (
                <FlexContainerRow style={{ padding: "1rem" }}>
                  <i>No annotations yet! Add new annotations using the button below</i>
                </FlexContainerRow>
              )}
              <Button onClick={() => addNewAnnotation(page.id)}>Add new annotation</Button>
            </Accordian>
          </LightBox>
        );
      })}
    </>
  );
};
