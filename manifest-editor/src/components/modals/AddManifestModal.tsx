import { useState, useEffect, useContext } from "react";

import { Input, InputLabel } from "../../editors/Input";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { ModalHeader } from "../../atoms/ModalHeader";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";

import { useShell } from "../../context/ShellContext/ShellContext";
import { analyse } from "../../helpers/analyse";
import { RecentFiles } from "../widgets/RecentFiles";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";

export const AddManifestModal: React.FC<{
  manifest: string;
  close: any;
  save: () => void;
}> = ({ manifest, close, save }) => {
  const [inputValue, setInputValue] = useState(manifest);
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
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>Open Manifest</ModalHeader>
          <Button aria-label="close" onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        {shellContext.unsavedChanges && (
          <WarningMessage $small={true}>
            Adding a new manifest will mean you will loose your unsaved changes.
            <Button aria-label="save changes" onClick={() => save()}>
              Save Changes
            </Button>
          </WarningMessage>
        )}
        <InputLabel>
          From content
          <Input placeholder={"Paste URL"} onChange={(e: any) => setInputValue(e.target.value)} />
        </InputLabel>
        <small>
          <i>Any IIIF Manifest.</i>
        </small>
        <HorizontalDivider />
        <FlexContainer style={{ justifyContent: "flex-end" }}>
          <SecondaryButton aria-label="cancel" onClick={() => close()}>
            CANCEL
          </SecondaryButton>
          <CalltoButton aria-label="add" onClick={() => handleChange()}>
            ADD
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
        <HorizontalDivider />
        <RecentFiles
          changeManifest={(id: string) => {
            shellContext.changeSelectedApplication("ManifestEditor");
            shellContext.changeResourceID(id);
            close();
          }}
          recentManifests={shellContext.recentManifests}
        />
      </ModalContainer>
    </>
  );
};