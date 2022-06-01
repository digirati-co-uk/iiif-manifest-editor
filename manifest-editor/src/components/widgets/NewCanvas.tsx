import { useCallback, useState } from "react";
import { Input, InputLabel } from "../../editors/Input";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { analyse } from "../../helpers/analyse";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { useExistingVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { IIIFBuilder } from "iiif-builder";
import { PaddingComponentLarge, PaddingComponentMedium, PaddingComponentSmall } from "../../atoms/PaddingComponent";
import { TickIcon } from "../../icons/TickIcon";
import { Loading } from "../../atoms/Loading";
import { v4 } from "uuid";
import { useApps, useAppState } from "../../shell/AppContext/AppContext";
import { useProjectCreators } from "../../shell/ProjectContext/ProjectContext.hooks";

export const NewCanvas: React.FC<{ close: () => void }> = ({ close }) => {
  const { createProjectFromManifestId } = useProjectCreators();
  const { currentApp, changeApp } = useApps();
  const { state, setState } = useAppState();
  const [inputValue, setInputValue] = useState<string | undefined>();
  const [inputType, setInputType] = useState<string | undefined>();
  const [label, setLabel] = useState<string | undefined>();
  const [width, setWidth] = useState<number | undefined>(2000);
  const [height, setHeight] = useState<number | undefined>(1000);
  const [duration, setDuration] = useState<number | undefined>();
  const [imageServiceJSON, setImageServiceJSON] = useState<any>();
  const [emptyCanvas, setEmptyCanvas] = useState(false);
  const [addAnother, setAddAnother] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedApplication = currentApp?.id;

  const vault = useExistingVault();
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

  const insertAfterSelected = () => {
    const canvas = state.canvasId;
    if (manifest) {
      const latestManifest = vault.get(manifest.id);
      if (canvas && latestManifest) {
        const index = latestManifest?.items
          .map((e: any) => {
            return e.id;
          })
          .indexOf(canvas);
        const newOrder = latestManifest ? [...latestManifest.items] : [];
        // The new canvas will by default be on the end
        const newCanvas = newOrder.pop();
        if (newCanvas) newOrder.splice(index + 1, 0, newCanvas);
        vault.modifyEntityField(latestManifest, "items", newOrder);
      }
    }
  };

  const handleChange = async () => {
    const newCanvasID = `vault://${v4()}`;
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
      insertAfterSelected();
      setState({ canvasId: newCanvasID });
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
      insertAfterSelected();

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
      insertAfterSelected();

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
      {!emptyCanvas && (
        <div>
          <InputLabel>From content</InputLabel>
          <FlexContainer>
            <Input
              placeholder={inputValue}
              value={inputValue}
              onChange={(e: any) => setInputValue(e.target.value)}
              onPaste={() => runAnalyser()}
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
      {inputType && !emptyCanvas && inputType === "Image" && selectedApplication === "manifest-editor" && (
        <>
          <HorizontalDivider />
          <FlexContainer>
            <img src={inputValue} height={100} style={{ transition: "all 0.3s ease-in" }} />
            <PaddingComponentLarge />
            <small>
              This image/service is {width} x {height}, the Manifest Editor will create a Canvas {width} x {height} from
              this image/service.
            </small>
          </FlexContainer>
        </>
      )}
      {inputType && !emptyCanvas && inputType === "ImageService" && selectedApplication === "manifest-editor" && (
        <>
          <HorizontalDivider />
          <FlexContainer>
            <img src={inputValue + "/full/!200,200/0/default.jpg"} height={200} />
            <PaddingComponentLarge />

            <img src={"https://iiif.io/assets/images/logos/logo-sm.png"} height={20} />

            <PaddingComponentLarge />
            <small>
              This image/service is {width} x {height}, the Manifest Editor will create a Canvas {width} x {height} from
              this image/service.
            </small>
          </FlexContainer>
        </>
      )}
      <HorizontalDivider />
      <FlexContainer style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        <InputLabel $inline={true}>
          <Input type={"checkbox"} onChange={(e: any) => setEmptyCanvas(!emptyCanvas)} checked={emptyCanvas} />
          Empty Canvas
        </InputLabel>
        <FlexContainerColumn justify="flex-end" style={{ alignItems: "flex-end" }}>
          <FlexContainer>
            <SecondaryButton aria-label="cancel" onClick={() => close()}>
              CANCEL
            </SecondaryButton>
            <PaddingComponentSmall />
            <PaddingComponentSmall />

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
          <PaddingComponentSmall>
            <InputLabel $inline={true} style={{ justifySelf: "flex-end" }}>
              Add another
              <Input type={"checkbox"} onChange={(e: any) => setAddAnother(!addAnother)} checked={addAnother} />
            </InputLabel>
          </PaddingComponentSmall>
        </FlexContainerColumn>
      </FlexContainer>
      <br />
      {!(inputType === "Image" || inputType === "ImageService") &&
        inputType &&
        selectedApplication === "manifest-editor" && (
          <FlexContainerColumn justify={"flex-start"}>
            <p>This resource is not an image.</p>
            <small>{inputType}</small>
            <small>{label}</small>
          </FlexContainerColumn>
        )}
      {inputType === "Collection" && inputType && selectedApplication === "manifest-editor" && (
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
                changeApp({ id: "collection-explorer", args: inputValue });
                close();
              }}
            >
              Launch Application
            </Button>
          </FlexContainer>
        </>
      )}
      {inputType === "Manifest" && inputType && selectedApplication === "manifest-editor" && inputValue && (
        <>
          <HorizontalDivider />
          <FlexContainer style={{ justifyContent: "space-between" }}>
            <img src={"https://iiif.io/assets/images/logos/logo-sm.png"} height={20} />
            <PaddingComponentMedium />
            <small>This resource is a manifest, do you want to start a new manifest from this resource?</small>
            <Button
              aria-label="load-manifest"
              onClick={() => {
                createProjectFromManifestId(inputValue).then(close);
              }}
            >
              Load Manifest
            </Button>
          </FlexContainer>
        </>
      )}
    </>
  );
};
