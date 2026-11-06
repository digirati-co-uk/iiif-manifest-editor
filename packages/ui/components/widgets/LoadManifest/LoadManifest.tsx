import { useTranslations } from "@manifest-editor/i18n";
import { useState, useEffect } from "react";
import { Input, Submit } from "@/editors/Input";
import { Button, SecondaryButton } from "@/atoms/Button";
import { FlexContainer, FlexContainerColumn } from "@/components/layout/FlexContainer";
import { analyse } from "@/helpers/analyse";
import { PaddingComponentSmall } from "@/atoms/PaddingComponent";
import { LoadManifestWidget } from "./LoadManifest.style";
import { useProjectContext } from "@/shell";
import { useProjectCreators } from "@/shell";
import { useApps } from "@/shell";
import { InfoMessage } from "@/madoc/components/callouts/InfoMessage";
import { TickIcon } from "@/icons/TickIcon";
import { BlockIcon } from "@/icons/BlockIcon";
import { CloseIcon } from "@/icons/CloseIcon";

export const LoadManifest: React.FC = () => {
  const t = useTranslations("ui");
  const { createProjectFromManifestId, createBlankManifest } = useProjectCreators();
  const { currentApp, changeApp } = useApps();
  const { current: currentProject } = useProjectContext();

  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState<string | undefined>();
  const [label, setLabel] = useState<string | undefined>();
  const [width, setWidth] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [imageServiceJSON, setImageServiceJSON] = useState<any>();

  useEffect(() => {
    // Clear the populated value if we use a new url
    setInputType(undefined);
    setLabel(undefined);
    setWidth(undefined);
    setHeight(undefined);
    setImageServiceJSON(undefined);
  }, [inputValue]);

  const handleChange = async () => {
    const inputed = await analyse(inputValue);
    setInputType(inputed?.type);
    setLabel(inputed?.label);
    setHeight(inputed?.height);
    setWidth(inputed?.width);
    if (inputed && !(inputed.type === "Manifest" || inputed.type === "Image" || inputed.type === "Collection")) {
      setImageServiceJSON(inputed);
    }
  };

  const createProject = async () => {
    await handleChange();
    if (inputValue && inputType === "Manifest") {
      await createProjectFromManifestId(inputValue);
    }
  };

  const currentProjectWarning = () => (
    <InfoMessage $banner>
      {currentProject?.name}
      <Button style={{ marginLeft: 20 }} onClick={() => changeApp({ id: "manifest-editor" })}>
        {t("load.continue")}
      </Button>
    </InfoMessage>
  );

  const isCollection =
    inputType === "Collection" && inputType && (currentApp.id === "manifest-editor" || currentApp.id === "splash") ? (
      <FlexContainer>
        <BlockIcon />
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <small>{t("load.collection")}</small>
        </FlexContainer>
      </FlexContainer>
    ) : null;

  const isNotManifest =
    inputType &&
    !["Manifest", "Collection"].includes(inputType) &&
    inputValue !== "" &&
    (currentApp.id === "manifest-editor" || currentApp.id === "splash") ? (
      <FlexContainer>
        <BlockIcon />
        <FlexContainerColumn justify={"flex-start"}>
          <p>{t("load.notManifest")}</p>
          <small>{inputType}</small>
          <small>{label}</small>
          <small>{width && t("load.width", { width })}</small>
          <small>{height && t("load.height", { height })}</small>
          {imageServiceJSON && <small>{JSON.stringify(imageServiceJSON)}</small>}
        </FlexContainerColumn>
      </FlexContainer>
    ) : null;

  const isValidManifest =
    inputType === "Manifest" && inputType && (currentApp.id === "manifest-editor" || currentApp.id === "splash") ? (
      <div>
        <TickIcon /> {t("load.valid")}
      </div>
    ) : (
      <div>
        <CloseIcon /> {t("load.invalid")}
      </div>
    );

  return (
    <FlexContainerColumn justify={"flex-start"} style={{ width: "90%", margin: "auto" }}>
      {currentProject && currentProjectWarning()}
      <h1>{t("load.start")}</h1>
      <p>{t("load.existing")}</p>
      <LoadManifestWidget
        onSubmit={(e) => {
          e.preventDefault();
          createProject();
        }}
      >
        <Input
          placeholder={t("load.placeholder")}
          onChange={(e: any) => setInputValue(e.target.value)}
          onBlur={handleChange}
          onPaste={handleChange}
        />
        <PaddingComponentSmall />
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <Submit aria-label={t("actions.add")} onClick={handleChange} />
          <PaddingComponentSmall />
          <p>{t("load.or")}</p>
          <PaddingComponentSmall />
          <SecondaryButton aria-label={t("actions.add")} onClick={createBlankManifest}>
            {t("load.create")}
          </SecondaryButton>
        </FlexContainer>
      </LoadManifestWidget>
      <PaddingComponentSmall />
      {isValidManifest}
      {isNotManifest}
      {isCollection}
    </FlexContainerColumn>
  );
};
