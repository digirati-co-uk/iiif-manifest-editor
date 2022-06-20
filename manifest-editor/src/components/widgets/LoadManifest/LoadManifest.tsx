import { useState, useEffect } from "react";
import { Input, Submit } from "../../../editors/Input";
import { Button, SecondaryButton } from "../../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import { analyse } from "../../../helpers/analyse";
import { PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { LoadManifestWidget } from "./LoadManifest.style";
import { useProjectContext } from "../../../shell/ProjectContext/ProjectContext";
import { useProjectCreators } from "../../../shell/ProjectContext/ProjectContext.hooks";
import { useApps } from "../../../shell/AppContext/AppContext";
import { InfoMessage } from "../../../madoc/components/callouts/InfoMessage";
import { TickIcon } from "../../../icons/TickIcon";
import { BlockIcon } from "../../../icons/BlockIcon";
import { CloseIcon } from "../../../icons/CloseIcon";

export const LoadManifest: React.FC = () => {
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
        Continue editing
      </Button>
    </InfoMessage>
  );

  const isCollection =
    inputType === "Collection" && inputType && (currentApp.id === "manifest-editor" || currentApp.id === "splash") ? (
      <FlexContainer>
        <BlockIcon />
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <small>This resource is a collection, please provide a IIIF Manifest.</small>
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
          <p>This resource is not a manifest.</p>
          <small>{inputType}</small>
          <small>{label}</small>
          <small>{width && `Image width: ${width}`}</small>
          <small>{height && `Image height: ${height}`}</small>
          {imageServiceJSON && <small>{JSON.stringify(imageServiceJSON)}</small>}
        </FlexContainerColumn>
      </FlexContainer>
    ) : null;

  const isValidManifest =
    inputType === "Manifest" && inputType && (currentApp.id === "manifest-editor" || currentApp.id === "splash") ? (
      <div>
        <TickIcon /> Valid IIIF Manifest
      </div>
    ) : (
      <div>
        <CloseIcon /> Invalid IIIF Manifest
      </div>
    );

  return (
    <FlexContainerColumn justify={"flex-start"} style={{ width: "90%", margin: "auto" }}>
      {currentProject && currentProjectWarning()}
      <h1>Get started</h1>
      <p>Load an existing IIIF Manifest</p>
      <LoadManifestWidget
        onSubmit={(e) => {
          e.preventDefault();
          createProject();
        }}
      >
        <Input
          placeholder={"Enter a IIIF manifest URL"}
          onChange={(e: any) => setInputValue(e.target.value)}
          onBlur={handleChange}
          onPaste={handleChange}
        />
        <PaddingComponentSmall />
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <Submit aria-label="add" onClick={handleChange} />
          <PaddingComponentSmall />
          <p>or</p>
          <PaddingComponentSmall />
          <SecondaryButton aria-label="add" onClick={createBlankManifest}>
            CREATE NEW
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
