import { IIIFBuilder } from "iiif-builder";
import { useCanvas, useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { AnnotationPreview } from "../../components/organisms/Annotation/Annotation";
import { LanguageFieldEditor } from "../generic/LanguageFieldEditor/LanguageFieldEditor";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";
import { Input, InputLabel } from "../Input";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { FlexContainerColumn, FlexContainerRow } from "../../components/layout/FlexContainer";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../atoms/PaddingComponent";
import { useAnnotationList } from "../../hooks/useAnnotationsList";
import { LightBox } from "../../atoms/LightBox";
import { getValue } from "@iiif/vault-helpers";
import { Accordian } from "../../components/organisms/Accordian/Accordian";
import { useState } from "react";
import { NewAnnotationPageForm } from "./NewAnnotationPageForm";

export const AnnotationForm = () => {
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();
  const { defaultLanguages } = useConfig();

  const [showNewAnnotationPage, setShowNewAnnotationPage] = useState(false);

  const {
    annotations,
    pagedAnnotations,
    isEditing,
    setIsEditing,
    addNewAnnotation,
    addNewAnnotationPage,
    selectedAnnotation,
    setSelectedAnnotation,
    editAnnotation,
    onDeselect,
  } = useAnnotationList(canvas?.id);

  const guidanceReference = "https://iiif.io/api/presentation/3.0/#annotations";

  function items(item: any) {
    // @ts-ignore
    return vault.get(item.id)?.items.map((NESTEDITEM: any) => {
      return <AnnotationPreview key={NESTEDITEM.id} id={NESTEDITEM.id} />;
    });
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
    // @ts-ignore
    return vault.get(canvas.annotations).map((page: any) => {
      return (
        <>
          <Accordian renderOpen={false} title={getValue(page.label) || "Annotation Page Properties"}>
            <LanguageFieldEditor
              key={page.id}
              label={"label"}
              fields={page.label}
              availableLanguages={defaultLanguages}
              onSave={(e: any) => {
                // todo not working
                vault.modifyEntityField(page.id, "target", e.toInternationalString());
              }}
              property={"label"}
            />
            <InputLabel>
              identifier
              <Input key={page.id} value={page.id} disabled={true} property={"behavior"} />
            </InputLabel>
            <InputLabel>
              behavior
              <Input
                key={page.id}
                value={page.behavior}
                onChange={(e: any) => {
                  // todo not working
                  vault.modifyEntityField(page.id, "behavior", e.target.value);
                }}
                property={"behavior"}
              />
            </InputLabel>
            <InputLabel>
              format
              <Input
                key={page.id}
                value={page.format}
                onChange={(e: any) => {
                  // todo not working
                  vault.modifyEntityField(page.id, "format", e.target.value);
                }}
                property={"format"}
              />
            </InputLabel>
            <InputLabel>
              language
              <Input
                key={page.id}
                value={page.language}
                onChange={(e: any) => {
                  // todo not working
                  vault.modifyEntityField(page.id, "language", e.target.value);
                }}
                property={"language"}
              />
            </InputLabel>
            <PaddingComponentSmall />
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
            <Button onClick={addNewAnnotation}>Add new annotation</Button>
          </Accordian>
        </>
      );
    });
  }
  return (
    <>
      <EmptyProperty label={"annotations"} guidanceReference={guidanceReference} />
      {showNewAnnotationPage ? <NewAnnotationPageForm /> : annoPages()}
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
