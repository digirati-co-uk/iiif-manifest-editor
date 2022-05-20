import { useState, useEffect } from "react";
import { Input } from "../../editors/Input";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";

import { useShell } from "../../context/ShellContext/ShellContext";
import { analyse } from "../../helpers/analyse";
import { RecentFilesWidget } from "../../atoms/RecentFilesWidget";

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
    if ((inputed && inputed.type === "Manifest") || inputType === "Collection") {
      shellContext.changeResourceID(inputValue);
      if (shellContext.selectedApplication === "ManifestEditor" && inputed.type === "Manifest") {
        await shellContext.updateRecentManifests(inputValue);
        close();
      } else if (shellContext.selectedApplication === "Browser" && inputed.type === "Collection") {
        close();
      } else if (shellContext.selectedApplication === "Splash" && inputed.type === "Manifest") {
        shellContext.changeSelectedApplication("ManifestEditor");
        shellContext.changeResourceID(inputValue);
        close();
      } else if (shellContext.selectedApplication === "Splash" && inputed.type === "Collection") {
        shellContext.changeSelectedApplication("Browser");
        shellContext.changeResourceID(inputValue);
        close();
      }
    }
  };

  return (
    <>
      <RecentFilesWidget>
        <h4>
          Load an existing IIIF Manifest
          <Input
            placeholder={"Load any IIIF Manifest to get started"}
            onChange={(e: any) => setInputValue(e.target.value)}
          />
        </h4>
        <FlexContainer style={{ justifyContent: "flex-end" }}>
          <CalltoButton aria-label="add" onClick={() => handleChange()}>
            Load
          </CalltoButton>
        </FlexContainer>
        <br />
        {inputType !== "Manifest" && inputType && shellContext.selectedApplication === "ManifestEditor" && (
          <FlexContainerColumn justify={"flex-start"}>
            <p>This resource is not a manifest.</p>
            <small>{inputType}</small>
            <small>{label}</small>
            <small>{width && `Image width: ${width}`}</small>
            <small>{height && `Image height: ${height}`}</small>
            {imageServiceJSON && (
              <small
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(imageServiceJSON),
                }}
              />
            )}
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
                  close();
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
                  close();
                }}
              >
                Launch Application
              </Button>
            </FlexContainer>
          </>
        )}
      </RecentFilesWidget>
    </>
  );
};
