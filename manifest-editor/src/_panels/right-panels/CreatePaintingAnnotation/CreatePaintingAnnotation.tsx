import { useCanvas, useVault } from "react-iiif-vault";
import { Fieldset, Input, InputContainer, InputLabel } from "@/editors/Input";
import { useCallback, useRef, useState } from "react";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { Button, ButtonGroup, CalltoButton } from "@/atoms/Button";
import { analyse } from "@/helpers/analyse";
import { DimensionsTriplet } from "@/atoms/DimensionsTriplet";
import { TickIcon } from "@/icons/TickIcon";
import { addPaintingAnnotationToCanvas } from "@/helpers/add-painting-annotation-to-canvas";
import invariant from "tiny-invariant";
import { Simulate } from "react-dom/test-utils";
import {
  createImageServiceRequest,
  ImageServiceImageRequest,
  ImageServiceRequest,
  imageServiceRequestToString,
} from "@atlas-viewer/iiif-image-api";
import { ImageServiceSizeField } from "@/_components/form-elements/ImageServiceSizeField/ImageServiceSizeField";
import { IIIFExplorer } from "@/components/widgets/IIIFExplorer/IIIFExplorer";

export function CreatePaintingAnnotation() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>();
  const form = useRef<HTMLFormElement>(null);
  const media = useRef<HTMLInputElement>(null);
  const vault = useVault();
  const canvas = useCanvas();

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      invariant(canvas, "Unknown error");

      const data = new FormData(e.target as HTMLFormElement);

      // First step run the analysis.
      if (!result) {
        const mediaUrl = data.get("media-url");
        if (mediaUrl) {
          await runAnalyser(mediaUrl as string);
        }
        return;
      }

      // Otherwise we are confirming.
      const formData = Object.fromEntries(data.entries());

      if (result.type === "Sound") {
        addPaintingAnnotationToCanvas(vault, canvas, {
          ...result,
          type: formData["type"],
          duration: Number(formData["dims-duration"]),
          format: formData["format"],
        });
      }
      if (result.type === "Video") {
        addPaintingAnnotationToCanvas(vault, canvas, {
          ...result,
          type: formData["type"],
          width: Number(formData["dims-width"]),
          height: Number(formData["dims-height"]),
          duration: Number(formData["dims-duration"]),
          format: formData["format"],
        });
      }

      if (result.type === "Image") {
        addPaintingAnnotationToCanvas(vault, canvas, {
          ...result,
          type: formData["type"],
          width: Number(formData["dims-width"]),
          height: Number(formData["dims-height"]),
          format: formData["format"],
        });
      }

      if (result.type === "ImageService") {
        const [sizeWidth, sizeHeight] = formData["service-size"] ? (formData["service-size"] as string).split(",") : [];

        if (result["@id"]) {
          result.id = result["@id"];
        }
        const request = createImageServiceRequest(result);
        const url = imageServiceRequestToString({
          ...request,
          type: "image",
          size:
            sizeWidth && sizeHeight
              ? { width: Number(sizeWidth), height: Number(sizeHeight), max: false, confined: false, upscaled: false }
              : { max: true, confined: false, upscaled: false },
        } as ImageServiceImageRequest);

        addPaintingAnnotationToCanvas(vault, canvas, {
          id: url,
          type: formData["type"] as any,
          width: Number(formData["dims-width"]),
          height: Number(formData["dims-height"]),
          format: formData["format"] as string,
          service: [result],
        });
      }

      changeResource();

      // console.log("confirm.", data.get("media-url"), Object.fromEntries(data.entries()));
    },
    [canvas, result, vault]
  );

  const changeResource = () => {
    form.current!.reset();
    setResult(null);
  };

  const resetChanges = () => {
    form.current!.reset();
    media.current!.value = result.id || result["@id"];
  };

  const runAnalyser = async (data: string) => {
    if (data) {
      setIsRunning(true);

      setResult((await analyse(data)) || { error: "Unknown resource" });

      setIsRunning(false);
    }
  };

  if (!canvas) {
    return <div>No canvas selected</div>;
  }

  if (result && (result.type === "Manifest" || result.type === "Collection")) {
    return (
      <IIIFExplorer
        entry={result}
        window={false}
        onBack={() => setResult(null)}
        outputTypes={["Canvas"]}
        output={{ type: "image-service", allowImageFallback: true }}
        outputTargets={[
          {
            type: "callback",
            cb: (service) => {
              if (media.current) {
                media.current.value = service;
              }
              return runAnalyser(service);
            },
          },
        ]}
      />
    );
  }

  return (
    <PaddedSidebarContainer>
      <form ref={form} onSubmit={onSubmit}>
        <Fieldset disabled={isRunning}>
          <InputContainer fluid>
            <InputLabel htmlFor="media-url">Media URL</InputLabel>
            <Input
              ref={media}
              id="media-url"
              name="media-url"
              defaultValue={result ? result?.id || result["@id"] : ""}
              placeholder={"Paste URL of Media"}
              disabled={!!result}
              onBlur={(e) => runAnalyser(e.target.value)}
            />
          </InputContainer>
        </Fieldset>
        {result ? (
          <ButtonGroup>
            <Button type="button" onClick={changeResource}>
              Change resource
            </Button>
            <Button type="button" onClick={resetChanges}>
              Reset changes
            </Button>
          </ButtonGroup>
        ) : null}

        {result ? (
          result.error ? (
            <div>UNKNOWN RESOURCE</div>
          ) : (
            <div>
              <InputContainer wide>
                <InputLabel $margin htmlFor="type">
                  Type
                </InputLabel>
                <Input
                  id="type"
                  name="type"
                  list="valid-types"
                  defaultValue={result.type === "ImageService" ? "Image" : result.type}
                  placeholder={"Image, sound etc"}
                />
                <datalist id="valid-types">
                  <option value="Image" />
                  <option value="Sound" />
                  <option value="Audio" />
                  <option value="Video" />
                  <option value="Text" />
                </datalist>
              </InputContainer>

              <DimensionsTriplet
                width={result.width || 0}
                height={result.height || 0}
                duration={result.duration || 0}
              />

              <InputContainer wide>
                <InputLabel $margin htmlFor="format">
                  Format
                </InputLabel>
                <Input
                  id="format"
                  name="format"
                  list="formats"
                  defaultValue={result.type === "ImageService" ? "image/jpg" : result.format}
                  placeholder={"Format"}
                />
                <datalist id="formats">
                  <option value="image/jpeg" />
                  <option value="image/png" />
                  <option value="audio/mp4" />
                  <option value="audio/mp3" />
                  <option value="video/mp4" />
                  <option value="audio/wav" />
                  <option value="video/webm" />
                  <option value="model/gltf-binary" />
                  <option value="model/gltf+json" />
                  <option value="application/vnd.apple.mpegurl" />
                  <option value="application/dash+xml" />
                  <option value="text/plain" />
                </datalist>
              </InputContainer>

              {result.type === "ImageService" ? (
                <div style={{ marginBottom: "1em" }}>
                  <InputContainer wide>
                    <div>
                      <TickIcon /> Found image service.
                    </div>
                  </InputContainer>
                  <InputContainer wide>
                    <InputLabel $margin htmlFor="service-size">
                      Choose size for fallback
                    </InputLabel>
                    <ImageServiceSizeField imageService={result} id="service-size" />
                  </InputContainer>
                </div>
              ) : null}

              <ButtonGroup $right>
                <CalltoButton>Add to canvas</CalltoButton>
              </ButtonGroup>
            </div>
          )
        ) : null}
      </form>
    </PaddedSidebarContainer>
  );
}
