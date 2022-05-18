import { useState, useEffect, useContext } from "react";

import { Input, InputLabel } from "../../editors/Input";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { ModalHeader } from "../../atoms/ModalHeader";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";

import ShellContext from "../../apps/Shell/ShellContext";
import { analyse } from "../../helpers/analyse";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { useExistingVault, useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { IIIFBuilder } from "iiif-builder";
import { importEntities } from "@iiif/vault/actions";
import { PaddingComponentLarge, PaddingComponentMedium } from "../../atoms/PaddingComponent";
import { TickIcon } from "../../icons/TickIcon";
import { Loading } from "../../atoms/Loading";
import { v4 } from "uuid";

export const NewCanvasModal: React.FC<{
  close: any;
}> = ({ close }) => {
  const [inputValue, setInputValue] = useState<string | undefined>();
  const [inputType, setInputType] = useState<string | undefined>();
  const [label, setLabel] = useState<string | undefined>();
  const [width, setWidth] = useState<number | undefined>(2000);
  const [height, setHeight] = useState<number | undefined>(1000);
  const [duration, setDuration] = useState<number | undefined>();
  const [imageServiceJSON, setImageServiceJSON] = useState<any>();
  const newCanvasID = `vault://${v4()}`;
  const [emptyCanvas, setEmptyCanvas] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const vault = useExistingVault();

  const shellContext = useContext(ShellContext);
  const manifest = useManifest();

  const runAnalyser = async () => {
    setIsLoading(true);
    let inputed: any;
    if (inputValue) {
      inputed = await analyse(inputValue);
      setInputType(inputed?.type);
    }
    setLabel(inputed?.label);
    setHeight(inputed?.height);
    setWidth(inputed?.width);
    if (inputed && !(inputed.type === "Manifest" || inputed.type === "Image" || inputed.type === "Collection")) {
      setImageServiceJSON(inputed);
    }
    setIsLoading(false);
  };

  const handleChange = async (addAnother?: boolean) => {
    setIsLoading(true);
    let inputed: any;
    if (inputValue) {
      inputed = await analyse(inputValue);
      setInputType(inputed?.type);
    }
    setLabel(inputed?.label);
    setHeight(inputed?.height);
    setWidth(inputed?.width);
    if (inputed && !(inputed.type === "Manifest" || inputed.type === "Image" || inputed.type === "Collection")) {
      setImageServiceJSON(inputed);
    }
    setIsLoading(false);
    if (inputed && inputed.type === "Image" && !emptyCanvas && manifest) {
      const builder = new IIIFBuilder(vault);
      builder.editManifest(manifest.id, (mani: any) => {
        mani.createCanvas(newCanvasID, (can: any) => {
          can.height = inputed?.height;
          can.width = inputed?.width;
          can.createAnnotation(`${newCanvasID}/painting`, {
            id: `${newCanvasID}/painting`,
            type: "Annotation",
            motivation: "painting",
            body: {
              id: inputValue,
              type: "Image",
              format: inputed?.format,
              height: inputed?.height,
              width: inputed?.width,
            },
          });
        });
      });
      shellContext?.setUnsavedChanges(true);
      if (!addAnother) {
        close();
      }
    } else if (inputed && inputed.type === "ImageService" && !emptyCanvas && manifest) {
      const builder = new IIIFBuilder(vault);
      builder.editManifest(manifest.id, (mani) => {
        mani.createCanvas(newCanvasID, (can: any) => {
          can.height = inputed?.height;
          can.width = inputed?.width;
          can.createAnnotation(`${newCanvasID}/painting`, {
            id: `${newCanvasID}/painting`,
            type: "Annotation",
            motivation: "painting",
            body: [
              {
                id: inputValue,
                type: "Image",
                format: inputed?.format,
                height: inputed?.height,
                width: inputed?.width,
                service: [inputed],
              },
            ],
          });
        });
      });
      shellContext?.setUnsavedChanges(true);

      if (!addAnother) {
        close();
      }
    } else if (emptyCanvas && height && width && manifest) {
      const builder = new IIIFBuilder(vault);

      builder.editManifest(manifest.id, (mani) => {
        mani.createCanvas(newCanvasID, (canvas) => {
          canvas.height = height;
          canvas.width = width;
        });
      });
      shellContext?.setUnsavedChanges(true);
      if (!addAnother) {
        close();
      }
    }
    if (addAnother) {
      setInputValue("Paste URL of Media to create Canvas");
      setInputType(undefined);
    }
  };

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>Add canvas</ModalHeader>
          <Button aria-label="close" onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        {!emptyCanvas && (
          <div>
            <InputLabel>From content</InputLabel>
            <FlexContainer>
              <Input
                placeholder={inputValue}
                value={inputValue}
                onChange={(e: any) => setInputValue(e.target.value)}
                onBlur={() => runAnalyser()}
                onKeyPress={(e: any) => {
                  if (e.key === "Enter") {
                    runAnalyser();
                  }
                }}
              />
              <Button aria-label="validate url" onClick={() => runAnalyser()}>
                <TickIcon />
              </Button>
            </FlexContainer>

            <small>Any image, IIIF Image Service, audio, video, or IIIF Canvas.</small>
          </div>
        )}
        {isLoading && <Loading />}
        {emptyCanvas && (
          <>
            <InputLabel>Canvas dimensions</InputLabel>
            <FlexContainer style={{ justifyContent: "space-between" }}>
              <ErrorBoundary>
                <FlexContainerColumn>
                  <InputLabel>{"height"}</InputLabel>
                  <Input
                    type="number"
                    onChange={(e: any) => {
                      e.preventDefault();
                      setHeight(e.target.value);
                    }}
                    value={height}
                  />
                  <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#height"} />
                </FlexContainerColumn>
              </ErrorBoundary>
              <ErrorBoundary>
                <FlexContainerColumn>
                  <InputLabel>{"width"}</InputLabel>
                  <Input
                    type="number"
                    onChange={(e: any) => {
                      e.preventDefault();
                      setWidth(e.target.value);
                    }}
                    value={width}
                  />
                  <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#width"} />
                </FlexContainerColumn>
              </ErrorBoundary>
              <ErrorBoundary>
                <FlexContainerColumn>
                  <InputLabel>{"duration"}</InputLabel>
                  <Input
                    type="number"
                    onChange={(e: any) => {
                      e.preventDefault();
                      setDuration(e.target.value);
                    }}
                    value={duration}
                  />
                  <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#width"} />
                </FlexContainerColumn>
              </ErrorBoundary>
            </FlexContainer>
          </>
        )}
        {inputType && !emptyCanvas && inputType === "Image" && shellContext?.selectedApplication === "ManifestEditor" && (
          <>
            <HorizontalDivider />
            <FlexContainer>
              <img src={inputValue} height={100} style={{ transition: "all 0.3s ease-in" }} />
              <PaddingComponentLarge />
              <small>
                This image/service is {width} x {height}, the Manifest Editor will create a Canvas {width} x {height}{" "}
                from this image/service.
              </small>
            </FlexContainer>
          </>
        )}
        {inputType &&
          !emptyCanvas &&
          inputType === "ImageService" &&
          shellContext?.selectedApplication === "ManifestEditor" && (
            <>
              <HorizontalDivider />
              <FlexContainer>
                <img src={inputValue + "/full/!200,200/0/default.jpg"} height={200} />
                <PaddingComponentLarge />

                <img src={"https://iiif.io/assets/images/logos/logo-sm.png"} height={20} />

                <PaddingComponentLarge />
                <small>
                  This image/service is {width} x {height}, the Manifest Editor will create a Canvas {width} x {height}{" "}
                  from this image/service.
                </small>
              </FlexContainer>
            </>
          )}
        <HorizontalDivider />
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <InputLabel $inline={true}>
            Empty Canvas
            <Input type={"checkbox"} onChange={(e: any) => setEmptyCanvas(!emptyCanvas)} checked={emptyCanvas} />
          </InputLabel>
          <FlexContainer>
            <SecondaryButton aria-label="cancel" onClick={() => close()}>
              CANCEL
            </SecondaryButton>
            {emptyCanvas && (
              <CalltoButton disabled={!(width && height)} onClick={() => handleChange(true)} aria-label="add">
                ADD & ADD ANOTHER
              </CalltoButton>
            )}
            {!emptyCanvas && (
              <CalltoButton disabled={!inputValue} onClick={() => handleChange(true)} aria-label="add">
                ADD & ADD ANOTHER
              </CalltoButton>
            )}
            {emptyCanvas && (
              <CalltoButton disabled={!(width && height)} onClick={() => handleChange()} aria-label="add">
                ADD
              </CalltoButton>
            )}
            {!emptyCanvas && (
              <CalltoButton disabled={!inputValue} onClick={() => handleChange()} aria-label="add">
                ADD
              </CalltoButton>
            )}
          </FlexContainer>
        </FlexContainer>
        <br />
        {!(inputType === "Image" || inputType === "ImageService") &&
          inputType &&
          shellContext?.selectedApplication === "ManifestEditor" && (
            <FlexContainerColumn justify={"flex-start"}>
              <p>This resource is not an image.</p>
              <small>{inputType}</small>
              <small>{label}</small>
            </FlexContainerColumn>
          )}
        {inputType === "Collection" && inputType && shellContext?.selectedApplication === "ManifestEditor" && (
          <>
            <HorizontalDivider />
            <FlexContainer style={{ justifyContent: "space-between" }}>
              <img src={"https://iiif.io/assets/images/logos/logo-sm.png"} height={20} />
              <PaddingComponentMedium />
              <small>
                {/* This UI will change again */}
                This resource is a collection, do you want to launch the IIIF Browser App?
              </small>
              <Button
                aria-label="launch application"
                onClick={() => {
                  shellContext?.changeSelectedApplication("Browser");
                  if (inputValue) {
                    shellContext?.changeResourceID(inputValue);
                  }
                  close();
                }}
              >
                Launch Application
              </Button>
            </FlexContainer>
          </>
        )}
        {inputType === "Manifest" && inputType && shellContext?.selectedApplication === "ManifestEditor" && (
          <>
            <HorizontalDivider />
            <FlexContainer style={{ justifyContent: "space-between" }}>
              <img src={"https://iiif.io/assets/images/logos/logo-sm.png"} height={20} />
              <PaddingComponentMedium />
              <small>This resource is a manifest, do you want to start a new manifest from this resource?</small>
              <Button
                aria-label="load-manifest"
                onClick={() => {
                  if (inputValue) {
                    shellContext?.changeResourceID(inputValue);
                  }
                  shellContext?.changeSelectedApplication("ManifestEditor");
                  close();
                }}
              >
                Load Manifest
              </Button>
            </FlexContainer>
          </>
        )}
        {/* FOR DEBUGGING STATE */}
        {/* <Button onClick={() => console.log(JSON.stringify(vault.getState()))}>
          {" "}
          CLICK ME
        </Button> */}
      </ModalContainer>
    </>
  );
};
