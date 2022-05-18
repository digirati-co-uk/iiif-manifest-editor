import { addMapping, importEntities } from "@iiif/vault/actions";
import { useContext, useEffect, useState } from "react";
// hooks & context
import { useVault } from "react-iiif-vault";
import { analyse } from "../../helpers/analyse";
import { useManifest } from "../../hooks/useManifest";
import ShellContext from "../../apps/Shell/ShellContext";
// UI
import { Button, SecondaryButton } from "../../atoms/Button";
import { ErrorMessage } from "../../atoms/callouts/ErrorMessage";
import { SuccessMessage } from "../../atoms/callouts/SuccessMessage";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";
import { InformationLink } from "../../atoms/InformationLink";
import { DeleteIcon } from "../../icons/DeleteIcon";
import { InputLabel } from "../Input";
import { MediaResourceEditor } from "../MediaResourceEditor";

interface LogoWrapperProps {
  logoSrc: string;
  index: number;
  changeHandler: (newValue: any, index: number, property: "id" | "height" | "width" | "type") => void;
  height: number;
  width: number;
  type: string;
  serviceID: any[];
  placeholder?: boolean;
  forceUpdate?: () => void;
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
  placeholder = false,
  forceUpdate = () => {},
}) => {
  useEffect(() => {
    if (!placeholder) {
      analyser(logoSrc);
    }
  }, []);
  const [properties, setProperties] = useState<any>();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState(false);
  const [src, setSrc] = useState(logoSrc);

  // Triggered on blur of the URL value.
  const analyser = async (url: any) => {
    // We want to clear these values if they already exist.
    setProperties(undefined);
    setMessage(undefined);
    setError(false);
    let analysed: any;
    if (url) {
      setSrc(url);
      analysed = await analyse(url);
      setProperties(analysed);
      if (!["Image", "ContentResource", "ImageService"].includes(analysed?.type)) {
        setError(true);
      }
      if (analysed) {
        if (analysed.width === width && analysed.height === height) {
          return;
        }
        setMessage(`The URL provided is a ${analysed.width}x${analysed.height} ${analysed.type}.`);
      }
      // Regardless we want to update the vault with the new value.
      changeHandler(url, index, "id");
    }
  };

  const populateValues = () => {
    // Update the vault
    changeHandler(properties.height, index, "height");
    changeHandler(properties.width, index, "width");
    changeHandler(properties.type, index, "type");
    // Empty the temp state
    setProperties(undefined);
    setMessage(undefined);
    setTimeout(() => forceUpdate(), 100);
  };

  return (
    <div key={index + logoSrc + height + width}>
      {message && !error && (
        <SuccessMessage>
          <div>
            {message}
            <SecondaryButton onClick={() => populateValues()}>Use values</SecondaryButton>
          </div>
        </SuccessMessage>
      )}
      {error && (
        <ErrorMessage>
          <div>Please insert a valid image or IIIF image service URL.</div>
        </ErrorMessage>
      )}
      <MediaResourceEditor
        thumbnailSrc={logoSrc}
        changeThumbnailSrc={(newID: string) => {
          analyser(newID);
        }}
        changeHeight={(newHeight: number) => {
          changeHandler(newHeight, index, "height");
        }}
        changeWidth={(newWidth: number) => {
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
    </div>
  );
};

// Handles the whole list and speaks to the vault.
export const LogoForm = () => {
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();
  const [emptyValue, setEmptyValue] = useState(false);
  const [render, setRender] = useState(0);

  const addNew = () => {
    setEmptyValue(true);
  };

  const changeHandler = (data: any, index: number, property: "id" | "height" | "width" | "type") => {
    // If the property is the id, we want to add ref to this to the vault
    if (property === "id") {
      vault.dispatch(
        importEntities({
          entities: {
            ContentResource: {
              [data]: {
                id: data,
                type: "Image",
              },
            },
          },
        })
      );
      // We want to add the mapping in
      vault.dispatch(
        addMapping({
          id: data,
          type: "ContentResource",
        })
      );

      // Remove the empty UI component
      setEmptyValue(false);
      // And finally tell the vault to update which references are associated with the parent property
      const newLogoReference = manifest && manifest.logo ? [...manifest.logo] : [];
      if (manifest && (index || index === 0)) {
        newLogoReference[index] = { id: data, type: "ContentResource" };
        shellContext?.setUnsavedChanges(true);
        vault.modifyEntityField(manifest, "logo", newLogoReference);
      }
    } else {
      // get the ref we need using the index:
      const reference = manifest?.logo[index];
      // dispatch a change to this reference
      shellContext?.setUnsavedChanges(true);
      if (reference) {
        vault.modifyEntityField(reference, property, data);
      }
    }
  };

  const removeItem = (index: number) => {
    const newLogo = manifest && manifest.logo ? [...manifest.logo] : [];

    if (manifest && (index || index === 0)) {
      newLogo.splice(index, 1);
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, "logo", newLogo);
    }
  };
  if (!manifest || !vault) {
    return <div>Something went wrong</div>;
  }
  return (
    <>
      <InputLabel $inline={true}>
        logo
        <InformationLink guidanceReference={"https://iiif.io/api/presentation/3.0/#logonail"} />
      </InputLabel>
      {manifest &&
        vault.get(manifest.logo).map((logo: any, index: number) => {
          return (
            <>
              <div key={index + logo?.width + logo?.height} style={{ display: "flex", alignItems: "center" }}>
                <LogoWrapper
                  index={index}
                  logoSrc={logo?.id}
                  changeHandler={changeHandler}
                  height={logo?.height}
                  width={logo?.width}
                  type={logo?.type}
                  serviceID={logo?.service}
                  forceUpdate={() => setRender(render + 1)}
                />
                <Button onClick={() => removeItem(index)}>
                  <DeleteIcon />
                </Button>
              </div>
              {index !== manifest.logo.length - 1 && <HorizontalDivider />}
            </>
          );
        })}
      {/* If we want to add new we want to render a placeholder which once populated will
        go to vault  */}
      {emptyValue && (
        <div key={"new placeholder"} style={{ display: "flex", alignItems: "center" }}>
          <LogoWrapper
            placeholder={true}
            index={manifest.logo.length}
            logoSrc={""}
            changeHandler={changeHandler}
            height={0}
            width={0}
            type={"Image"}
            serviceID={[]}
          />
          <Button onClick={() => setEmptyValue(false)}>
            <DeleteIcon />
          </Button>
        </div>
      )}
      <SecondaryButton onClick={addNew}>
        {manifest && manifest.logo.length > 0 ? "Add another" : "Create"}
      </SecondaryButton>
    </>
  );
};
