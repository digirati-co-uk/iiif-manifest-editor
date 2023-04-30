import { useState, useEffect } from "react";
import { Input, InputLabel } from "@/editors/Input";
import { Button, CalltoButton, SecondaryButton } from "@/atoms/Button";
import { CloseIcon } from "@/icons/CloseIcon";
import { ModalBackground } from "@/components/layout/ModalBackground";
import { ModalContainer } from "@/components/layout/ModalContainer";
import { FlexContainer, FlexContainerColumn } from "@/components/layout/FlexContainer";
import { ModalHeader } from "@/atoms/ModalHeader";
import { HorizontalDivider } from "@/atoms/HorizontalDivider";
import { analyse } from "@/helpers/analyse";
import { RecentFiles } from "@/components/widgets/RecentFiles";
import { RecentFilesWidget } from "@/atoms/RecentFilesWidget";
import { useApps } from "@/shell";
import { useProjectCreators } from "@/shell";

export const AddManifestModal: React.FC<{
  manifest: string;
  close: any;
}> = ({ manifest, close }) => {
  const { createProjectFromManifestId } = useProjectCreators();
  const { currentApp, changeApp } = useApps();
  const [inputValue, setInputValue] = useState(manifest);
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
      return await createProjectFromManifestId(inputed.id);
    }

    if (inputed && inputed.type === "Collection") {
      changeApp({ id: "collection-explorer", args: inputed });
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
                onClick={() => {
                  changeApp({ id: "collection-explorer", args: inputValue });
                  close();
                }}
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
              <Button
                aria-label="launch application"
                onClick={() => {
                  createProjectFromManifestId(inputValue).then(close);
                }}
              >
                Launch Application
              </Button>
            </FlexContainer>
          </>
        )}
        <HorizontalDivider />
        <RecentFilesWidget>
          <RecentFiles />
        </RecentFilesWidget>
      </ModalContainer>
    </>
  );
};
