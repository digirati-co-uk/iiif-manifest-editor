import { IIIFBuilder } from "iiif-builder";
import { useCanvas, useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { EmptyProperty } from "../../atoms/EmptyProperty";
import { AnnotationPreview } from "../../components/organisms/Annotation/Annotation";
import { v4 } from "uuid";
import { LanguageFieldEditor } from "../generic/LanguageFieldEditor/LanguageFieldEditor";
import { useConfig } from "../../shell/ConfigContext/ConfigContext";
import { InputLabel } from "../Input";
import { Button, CalltoButton } from "../../atoms/Button";
import { FlexContainerColumn, FlexContainerRow } from "../../components/layout/FlexContainer";
import { PaddingComponentSmall } from "../../atoms/PaddingComponent";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";

export const AnnotationForm = () => {
  const canvas = useCanvas();
  const manifest = useManifest();
  const vault = useVault();
  const { defaultLanguages } = useConfig();

  const guidanceReference = "https://iiif.io/api/presentation/3.0/#annotations";

  const addNew = () => {
    const newID = `https://example.org/annotation/${v4()}`;

    if (!canvas || !manifest) {
      return;
    }
    // @todo get this working
    const builder = new IIIFBuilder(vault);
    builder.editManifest(manifest.id, (mani: any) => {
      mani.editCanvas(canvas.id, (can: any) => {
        can.createAnnotation(canvas.id, {
          id: `${newID}/annotation-page`,
          type: "AnnotationPage",
          motivation: "describing",
          body: {
            id: v4(),
            type: "TextualBody",
            format: "text/html",
            height: 500,
            width: 500,
          },
        });
      });
    });
  };

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
      <WarningMessage>
        <FlexContainerColumn>
          <small>
            <a style={{ color: "unset" }} href={item.id} target="_blank" rel="noopener noreferrer">
              {item.id}
            </a>
          </small>
          <br />
          <small>
            This annotation page has no items, either create a new annotation or convert the external resource to
            internal annotations for editing.
          </small>
          <FlexContainerRow>
            <CalltoButton onClick={() => addNew()}>Create one</CalltoButton>
            <PaddingComponentSmall />
            <CalltoButton onClick={() => convert(item.id)}>Convert to internal AnnotationPage</CalltoButton>
          </FlexContainerRow>
        </FlexContainerColumn>
      </WarningMessage>
    );
  }

  function isExternal(item: any) {
    // @ts-ignore
    return vault.get(item)?.items.length === 0;
  }

  function annoPages() {
    // @ts-ignore
    return vault.get(canvas.annotations).map((item: any) => {
      return (
        <>
          <LanguageFieldEditor
            key={item.id}
            label={"label"}
            fields={item.label}
            availableLanguages={defaultLanguages}
            onSave={() => {
              //DO Something
            }}
            property={"label"}
          />
          {isExternal(item) && externalConvert(item)}
          <InputLabel>items</InputLabel>

          {items(item)}
        </>
      );
    });
  }
  return (
    <>
      <EmptyProperty label={"annotations"} createNew={addNew} guidanceReference={guidanceReference} />
      {annoPages()}
    </>
  );
};
