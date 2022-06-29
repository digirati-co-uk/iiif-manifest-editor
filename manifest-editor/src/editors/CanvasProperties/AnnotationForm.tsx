import { IIIFBuilder } from "iiif-builder";
import { useCanvas, useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { AnnotationPreview } from "../../components/organisms/Annotation/Annotation";
import { v4 } from "uuid";
import { LanguageFieldEditor } from "../generic/LanguageFieldEditor/LanguageFieldEditor";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";
import { Input, InputLabel } from "../Input";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { FlexContainerColumn, FlexContainerRow } from "../../components/layout/FlexContainer";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../atoms/PaddingComponent";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";
import { useAnnotationList } from "../../hooks/useAnnotationsList";
import { useAnnotationPage } from "../../hooks/useAnnotationPage";
import { LightBox } from "../../atoms/LightBox";
import { getValue } from "@iiif/vault-helpers";
import { Accordian } from "../../components/organisms/Accordian/Accordian";

export const AnnotationForm = () => {
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();
  const { defaultLanguages } = useConfig();

  const {
    annotations,
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

  function convert(item: string) {
    vault.load(item);
  }

  function externalConvert(item: any) {
    return (
      <LightBox>
        <PaddingComponentSmall>
          <FlexContainerColumn>
            <h3 style={{ margin: "0.5rem" }}>{getValue(item.label)}</h3>
            <p>AnnotationPage</p>
            <small>
              <a style={{ color: "unset" }} href={item.id} target="_blank" rel="noopener noreferrer">
                {item.id}
              </a>
              <PaddingComponentSmall />
            </small>
            <br />
            <small>
              <i>
                This annotation page has no items, either create a new or make this page part of this manifest, for
                editing.
              </i>
            </small>
            <PaddingComponentSmall />
            <FlexContainerRow>
              <CalltoButton onClick={() => convert(item.id)}>Convert to internal AnnotationPage</CalltoButton>
            </FlexContainerRow>
          </FlexContainerColumn>
        </PaddingComponentSmall>
      </LightBox>
    );
  }

  function createNewAnnotationPage() {
    // @todo create the UI for creating new annotationPages
    addNewAnnotationPage();
  }

  function isExternal(item: any) {
    // @ts-ignore
    return vault.get(item)?.items.length === 0;
  }

  function annoPages() {
    if (vault.get(canvas?.annotations).length === 0) {
      return (
        <small>
          <i>
            This canvas has no annotations yet. You can either link to an existing external Annotation Page, or create a
            new Annotation Page to hold your annotations within this Manifest.
          </i>
          <PaddingComponentMedium />
          <FlexContainerRow justify="flex-end" onClick={createNewAnnotationPage}>
            <SecondaryButton>Create an annotation page</SecondaryButton>
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
              onSave={() => {
                //DO Something
              }}
              property={"label"}
            />
            <InputLabel>
              identifier
              <Input
                key={page.id}
                value={page.id}
                onChange={() => {
                  //DO Something
                }}
                property={"behavior"}
              />
            </InputLabel>
            <InputLabel>
              behavior
              <Input
                key={page.id}
                value={page.behavior}
                onChange={() => {
                  //DO Something
                }}
                property={"behavior"}
              />
            </InputLabel>
            <InputLabel>
              format
              <Input
                key={page.id}
                value={page.format}
                onChange={() => {
                  //DO Something
                }}
                property={"language"}
              />
            </InputLabel>
            <InputLabel>
              language
              <Input
                key={page.id}
                value={page.language}
                onChange={() => {
                  //DO Something
                }}
                property={"behavior"}
              />
            </InputLabel>
            <PaddingComponentSmall />
          </Accordian>
          <PaddingComponentMedium />

          {isExternal(page) && externalConvert(page)}

          <EmptyProperty label={"items"} createNew={addNewAnnotation} guidanceReference={guidanceReference} />
          <PaddingComponentMedium>{items(page)}</PaddingComponentMedium>
        </>
      );
    });
  }
  return (
    <>
      <EmptyProperty label={"annotations"} guidanceReference={guidanceReference} />
      {annoPages()}
    </>
  );
};
