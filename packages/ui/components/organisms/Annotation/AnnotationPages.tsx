import { useTranslations } from "@manifest-editor/i18n";
import { getValue } from "@iiif/helpers";
import { useVault, useCanvas } from "react-iiif-vault";
import { Button, CalltoButton } from "../../../atoms/Button";
import { LightBox } from "../../../atoms/LightBox";
import { PaddingComponentMedium, PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { useAnnotationList } from "../../../hooks/useAnnotationsList";
import { useVaultSelector } from "../../../hooks/useVaultSelector";
import { CloseIcon } from "../../../icons/CloseIcon";
import { FlexContainerColumn, FlexContainerRow } from "../../layout/FlexContainer";
import { Accordian } from "../Accordian/Accordian";
import { AnnotationItems } from "./AnnotationItems";
import { AnnotationPage } from "./AnnotationPage";

const SinglePage: React.FC<{ annotationPageID: string; canvasID: string }> = ({ annotationPageID, canvasID }) => {
  const t = useTranslations("ui");
  const page = useVaultSelector((state) => state.iiif.entities.AnnotationPage[annotationPageID]);
  if (!page) {
    return <div>{t("annotation.unavailable", { id: annotationPageID })}</div>;
  }
  const vault = useVault();
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
            <p>{t("annotation.pageType")}</p>
            <small>
              <a
                style={{ color: "unset", width: "100%", wordWrap: "break-word" }}
                href={annotationPage.id}
                target="_blank"
                rel="noopener noreferrer"
              >
                {annotationPage.id}
              </a>
              <PaddingComponentSmall />
            </small>
            <br />
            <small>
              <i>{t("annotation.convertHelp")}</i>
            </small>
            <PaddingComponentSmall />
            <FlexContainerRow>
              <CalltoButton onClick={() => convert(annotationPage)}>{t("annotation.convert")}</CalltoButton>
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
    <LightBox key={annotationPageID}>
      <FlexContainerRow justify="flex-end">
        <Button title={t("actions.delete")} onClick={() => removeAnnotationPage(page.id)}>
          <CloseIcon />
        </Button>
      </FlexContainerRow>
      <Accordian renderOpen={false} title={getValue(page?.label) || t("annotation.pageProperties")}>
        <AnnotationPage id={annotationPageID} />
      </Accordian>
      <PaddingComponentMedium />
      {isExternal(page) && externalConvert(page)}
      <Accordian renderOpen={false} title={t("annotation.items", { count: page.items.length })}>
        <PaddingComponentMedium>{items(page)}</PaddingComponentMedium>
        {page.items.length === 0 && (
          <FlexContainerRow style={{ padding: "1rem" }}>
            <i>{t("annotation.start")}</i>
          </FlexContainerRow>
        )}
        <Button onClick={() => addNewAnnotation(page.id)}>{t("annotation.add")}</Button>
      </Accordian>
    </LightBox>
  );
};

export const AnnotationPages: React.FC<{ canvasID: string }> = ({ canvasID }) => {
  const canvas = useCanvas({ id: canvasID });
  return (
    <>
      {canvas?.annotations.map((page: any) => {
        return <SinglePage annotationPageID={page.id} canvasID={canvasID} />;
      })}
    </>
  );
};
