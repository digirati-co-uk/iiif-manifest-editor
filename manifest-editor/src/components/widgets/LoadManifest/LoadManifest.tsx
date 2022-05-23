import { useState, useEffect } from "react";
import { Input } from "../../../editors/Input";
import { Button, CalltoButton, SecondaryButton } from "../../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../../layout/FlexContainer";
import { HorizontalDivider } from "../../../atoms/HorizontalDivider";

import { useShell } from "../../../context/ShellContext/ShellContext";
import { analyse } from "../../../helpers/analyse";
import { PaddingComponentSmall } from "../../../atoms/PaddingComponent";
import { LoadManifestWidget } from "./LoadManifest.style";

export const LoadManifest: React.FC<{}> = () => {
  const [inputValue, setInputValue] = useState("");
  const [inputType, setInputType] = useState<string | undefined>();
  const [label, setLabel] = useState<string | undefined>();
  const [width, setWidth] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [imageServiceJSON, setImageServiceJSON] = useState<any>();

  const shellContext = useShell();

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

    // Only handling manifest & collection for now.
    if (inputed && inputed.type === "Manifest") {
      await shellContext.changeResourceID(inputValue);
      await shellContext.changeSelectedApplication("ManifestEditor");
      if (shellContext.selectedApplication === "ManifestEditor" && inputed.type === "Manifest") {
        await shellContext.updateRecentManifests(inputValue);
      } else if (shellContext.selectedApplication === "Browser" && inputed.type === "Collection") {
      } else if (shellContext.selectedApplication === "Splash" && inputed.type === "Manifest") {
        await shellContext.changeResourceID(inputValue);
        await shellContext.changeSelectedApplication("ManifestEditor");
      } else if (shellContext.selectedApplication === "Splash" && inputed.type === "Collection") {
        await shellContext.changeResourceID(inputValue);
        await shellContext.changeSelectedApplication("Browser");
      }
    }
  };

  const newBlankTemplateUrl = window.location.href + shellContext.newTemplates.items[0].id;

  function loadBlankTemplate() {
    shellContext.changeResourceID(newBlankTemplateUrl);
    shellContext.changeSelectedApplication("ManifestEditor");
  }

  return (
    <FlexContainerColumn justify={"flex-start"} style={{ width: "90%", margin: "auto" }}>
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
          <SecondaryButton aria-label="add" onClick={() => loadBlankTemplate()}>
            CREATE NEW
          </SecondaryButton>
        </FlexContainer>
      </LoadManifestWidget>
      <br />
      {inputType !== "Manifest" && inputType && shellContext.selectedApplication === "ManifestEditor" && (
        <FlexContainerColumn justify={"flex-start"}>
          <p>This resource is not a manifest.</p>
          <small>{inputType}</small>
          <small>{label}</small>
          <small>{width && `Image width: ${width}`}</small>
          <small>{height && `Image height: ${height}`}</small>
          {imageServiceJSON && <small>{JSON.stringify(imageServiceJSON)}</small>}
        </FlexContainerColumn>
      )}
      {inputType === "Collection" && inputType && shellContext.selectedApplication === "ManifestEditor" && (
        <>
          <HorizontalDivider />
          <FlexContainer style={{ justifyContent: "space-between" }}>
            <small>
              {/* This UI will change again */}
              This resource is a collection, do you want to launch the IIIF Browser App?
            </small>
            <Button
              aria-label="launch application"
              onClick={() => {
                shellContext.changeSelectedApplication("Browser");
                shellContext.changeResourceID(inputValue);
              }}
            >
              Launch Application
            </Button>
          </FlexContainer>
        </>
      )}
      {inputType === "Manifest" && inputType && shellContext.selectedApplication === "Browser" && (
        <>
          <HorizontalDivider />
          <FlexContainer style={{ justifyContent: "space-between" }}>
            <small>
              {/* This UI will change again */}
              This resource is a manifest, do you want to launch the Manifest Editor App?
            </small>
            <Button
              aria-label="launch application"
              onClick={() => {
                shellContext.changeSelectedApplication("ManifestEditor");
              }}
            >
              Launch Application
            </Button>
          </FlexContainer>
        </>
      )}
    </FlexContainerColumn>
  );
};
