import { useState, useEffect } from "react";
import { Input } from "../../../editors/Input";
import { Button, CalltoButton, SecondaryButton } from "../../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import { HorizontalDivider } from "../../../atoms/HorizontalDivider";
import { analyse } from "../../../helpers/analyse";
import { PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { LoadManifestWidget } from "./LoadManifest.style";
import { useProjectContext } from "../../../shell/ProjectContext/ProjectContext";
import { useProjectCreators } from "../../../shell/ProjectContext/ProjectContext.hooks";
import { useApps } from "../../../shell/AppContext/AppContext";
import { SuccessMessage } from "../../../atoms/callouts/SuccessMessage";

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

    if (inputed && inputed.type === "Manifest") {
      await createProjectFromManifestId(inputed.id);
    }
  };

  return (
    <FlexContainerColumn justify={"flex-start"} style={{ width: "90%", margin: "auto" }}>
      {currentProject ? (
        <SuccessMessage>
          {currentProject.name}{" "}
          <Button style={{ marginLeft: 20 }} onClick={() => changeApp({ id: "manifest-editor-layouts" })}>
            Continue editing
          </Button>
        </SuccessMessage>
      ) : null}
      <h1>Get started</h1>
      <p>Load an existing IIIF Manifest</p>
      <LoadManifestWidget>
        <Input placeholder={"Enter a IIIF manifest URL"} onChange={(e: any) => setInputValue(e.target.value)} />
        <PaddingComponentSmall />

        <FlexContainer style={{ justifyContent: "space-between" }}>
          <CalltoButton aria-label="add" onClick={() => handleChange()}>
            LOAD
          </CalltoButton>
          <PaddingComponentSmall />
          <p>or</p>
          <PaddingComponentSmall />
          <SecondaryButton aria-label="add" onClick={() => createBlankManifest()}>
            CREATE NEW
          </SecondaryButton>
        </FlexContainer>
      </LoadManifestWidget>
      <br />
      {inputType !== "Manifest" && inputType && currentApp.id === "manifest-editor" && (
        <FlexContainerColumn justify={"flex-start"}>
          <p>This resource is not a manifest.</p>
          <small>{inputType}</small>
          <small>{label}</small>
          <small>{width && `Image width: ${width}`}</small>
          <small>{height && `Image height: ${height}`}</small>
          {imageServiceJSON && <small>{JSON.stringify(imageServiceJSON)}</small>}
        </FlexContainerColumn>
      )}
      {inputType === "Collection" && inputType && currentApp.id === "manifest-editor" && (
        <>
          <HorizontalDivider />
          <FlexContainer style={{ justifyContent: "space-between" }}>
            <small>
              {/* This UI will change again */}
              This resource is a collection, do you want to launch the IIIF Browser App?
            </small>
            <Button
              aria-label="launch application"
              onClick={() => changeApp({ id: "collection-explorer", args: inputValue })}
            >
              Launch Application
            </Button>
          </FlexContainer>
        </>
      )}
      {inputType === "Manifest" && inputType && currentApp.id === "collection-explorer" && (
        <>
          <HorizontalDivider />
          <FlexContainer style={{ justifyContent: "space-between" }}>
            <small>
              {/* This UI will change again */}
              This resource is a manifest, do you want to launch the Manifest Editor App?
            </small>
            <Button aria-label="launch application" onClick={() => changeApp({ id: "manifest-editor" })}>
              Launch Application
            </Button>
          </FlexContainer>
        </>
      )}
    </FlexContainerColumn>
  );
};
