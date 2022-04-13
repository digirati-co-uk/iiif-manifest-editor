import { useContext, useState } from "react";
import { useVault } from "react-iiif-vault";
import { analyse } from "../../../helpers/analyse";
import { useManifest } from "../../../hooks/useManifest";
import ShellContext from "../../apps/Shell/ShellContext";
import { CalltoButton, SecondaryButton } from "../../atoms/Button";
import { SuccessMessage } from "../../atoms/callouts/SuccessMessage";
import { InformationLink } from "../../atoms/InformationLink";
import { FlexContainerColumn } from "../../layout/FlexContainer";
import { InputLabel } from "../Input";
import { MediaResourceEditor } from "../MediaResourceEditor";

interface ThumbnailWrapperProps {
  thumbnailSrc: string;
  index: number;
  changeHandler: (
    newValue: any,
    index: number,
    property: "id" | "height" | "width" | "type"
  ) => void;
  height: number;
  width: number;
  type: string;
  serviceID: any[];
}

// Wrapper layer required to handle the logic of showing option to pre-populate
// from the url analyser whilst keeping Media ResourceEditor logic and state free

const ThumbnailWrapper: React.FC<ThumbnailWrapperProps> = ({
  thumbnailSrc,
  changeHandler,
  index,
  height,
  width,
  type,
  serviceID,
}) => {
  const [properties, setProperties] = useState<any>();
  const [message, setMessage] = useState<string>();

  // Triggered on blur of the URL value.
  const analyser = async (
    url: any,
    idx?: number,
    property?: "id" | "height" | "width" | "type"
  ) => {
    // We want to clear these values if they already exist.
    setProperties(undefined);
    setMessage(undefined);
    let analysed: any;
    if (url) {
      analysed = await analyse(url);
      setProperties(analysed);
      setMessage(
        `The URL provided is a ${analysed.width}x${analysed.height} ${analysed.type}.`
      );
      // Regardless we want to update the vault with the new value.
      changeHandler(url, index, "id");
    }
  };

  const populateValues = () => {
    console.log(properties);
    if (properties.height && properties.width) {
      changeHandler(properties.height, index, "height");
      changeHandler(properties.width, index, "width");
    }
  };

  return (
    <>
      {message && (
        <SuccessMessage>
          <div>
            {message}
            <SecondaryButton onClick={() => populateValues()}>
              Use values
            </SecondaryButton>
          </div>
        </SuccessMessage>
      )}
      <MediaResourceEditor
        thumbnailSrc={thumbnailSrc}
        changeThumbnailSrc={(newID: string) => {
          analyser(newID, index, "id");
        }}
        changeHeight={(newHeight: Number) => {
          changeHandler(newHeight, index, "height");
        }}
        changeWidth={(newWidth: Number) => {
          changeHandler(newWidth, index, "width");
        }}
        height={height}
        width={width}
        type={type}
        changeType={(newType: string) => {
          changeHandler(newType, index, "type");
        }}
        serviceID={serviceID}
      />
    </>
  );
};

// Handles the whole list and speaks to the vault.
// TODO implement delete, reorder and the services.
export const ThumbnailForm = () => {
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();

  const addNew = () => {
    const withNew = manifest ? [...manifest.thumbnail] : [];
    // @ts-ignore
    withNew.push({ id: "", height: 0, width: 0, type: "Image" });
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, "thumbnail", withNew);
    }
  };

  const changeHandler = (
    data: any,
    index?: number,
    property?: "id" | "height" | "width" | "type"
  ) => {
    const newImage =
      manifest && manifest.thumbnail ? [...manifest.thumbnail] : [];
    if (manifest && (index || index === 0) && property) {
      // @ts-ignore
      newImage[index][property] = data;
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, "thumbnail", newImage);
    }
  };
  return (
    <>
      <InputLabel>Thumbnail</InputLabel>
      {manifest &&
        manifest.thumbnail.map((thumb: any, index: number) => {
          return (
            <div key={thumb?.id + index + thumb?.width + thumb?.height}>
              <ThumbnailWrapper
                index={index}
                thumbnailSrc={thumb?.id}
                changeHandler={changeHandler}
                height={thumb?.height}
                width={thumb?.width}
                type={thumb?.type}
                serviceID={thumb?.service}
              />
              <InformationLink
                guidanceReference={
                  "https://iiif.io/api/presentation/3.0/#thumbnail"
                }
              />
            </div>
          );
        })}
      <SecondaryButton onClick={addNew}>Create</SecondaryButton>
    </>
  );
};
