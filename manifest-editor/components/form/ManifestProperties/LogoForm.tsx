import { useContext, useState } from "react";
import { useVault } from "react-iiif-vault";
import { analyse } from "../../../helpers/analyse";
import { useManifest } from "../../../hooks/useManifest";
import ShellContext from "../../apps/Shell/ShellContext";
import { Button, SecondaryButton } from "../../atoms/Button";
import { SuccessMessage } from "../../atoms/callouts/SuccessMessage";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { InformationLink } from "../../atoms/InformationLink";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { InputLabel } from "../Input";
import { MediaResourceEditor } from "../MediaResourceEditor";

interface LogoWrapperProps {
  logoSrc: string;
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

const LogoWrapper: React.FC<LogoWrapperProps> = ({
  logoSrc,
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
    // Update the vault
    changeHandler(properties.height, index, "height");
    changeHandler(properties.width, index, "width");
    // Empty the temp state
    setProperties(undefined);
    setMessage(undefined);
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
        thumbnailSrc={logoSrc}
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
export const LogoForm = () => {
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();

  const addNew = () => {
    const withNew = manifest ? [...manifest.logo] : [];
    // @ts-ignore
    withNew.push({ id: "", height: 0, width: 0, type: "Image" });
    if (manifest) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, "logo", withNew);
    }
  };

  const changeHandler = (
    data: any,
    index?: number,
    property?: "id" | "height" | "width" | "type"
  ) => {
    const newImage = manifest && manifest.logo ? [...manifest.logo] : [];
    if (manifest && (index || index === 0) && property) {
      // @ts-ignore
      newImage[index][property] = data;
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, "logo", newImage);
    }
  };

  const removeItem = (index: number) => {
    const newThumbnail = manifest && manifest.logo ? [...manifest.logo] : [];

    if (manifest && (index || index === 0)) {
      newThumbnail.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, "logo", newThumbnail);
    }
  };
  return (
    <>
      <InputLabel>logo</InputLabel>
      {manifest &&
        manifest.logo.map((logo: any, index: number) => {
          return (
            <div>
              <div
                key={index + logo?.width + logo?.height}
                style={{ display: "flex", alignItems: "center" }}
              >
                <LogoWrapper
                  index={index}
                  logoSrc={logo?.id}
                  changeHandler={changeHandler}
                  height={logo?.height}
                  width={logo?.width}
                  type={logo?.type}
                  serviceID={logo?.service}
                />
                <Button onClick={() => removeItem(index)}>
                  <DeleteIcon />
                </Button>
              </div>
              {index !== manifest.logo.length - 1 && <HorizontalDivider />}
            </div>
          );
        })}
      <SecondaryButton onClick={addNew}>
        {manifest && manifest.logo.length > 0 ? "Add another" : "Create"}
      </SecondaryButton>
      <InformationLink
        guidanceReference={"https://iiif.io/api/presentation/3.0/#logonail"}
      />
    </>
  );
};
