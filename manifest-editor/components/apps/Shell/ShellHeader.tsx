import { useManifest } from "../../../hooks/useManifest";
import { ShellHeaderStrip } from "./ShellHeaderStrip";
import { FlexContainer } from "../../layout/FlexContainer";
import { ManifestEditorIcon } from "../../icons/ManifestEditorIcon";
import { Placeholder } from "../../atoms/Placeholder";
import { DropdownPreviewMenu } from "../../atoms/DropdownPreviewMenu";
import { Persistance } from "../../../pages";
import { getValue } from "@iiif/vault-helpers";

export const ShellHeader: React.FC<{
  saveManifest: () => Promise<void>;
  showAgain: boolean;
  setSelectedPreviewIndex: (index: number) => void;
  previewConfig: any;
  selectedPreviewIndex: number;
  persistedManifest: Persistance;
}> = ({
  saveManifest,
  showAgain,
  setSelectedPreviewIndex,
  previewConfig,
  selectedPreviewIndex,
  persistedManifest
}) => {
  const manifest = useManifest();

  const getTitle = () => {
    //  This needs to actually adapt for the specific content and default language
    if (
      manifest &&
      manifest.label &&
      manifest.label.none &&
      manifest.label.none[0]
    ) {
      return (
        <h5>
          IIIF {manifest.type} : {getValue(manifest.label)}
        </h5>
      );
    }
    return <h5>IIIF Manifest Editor</h5>;
  };

  return (
    <ShellHeaderStrip>
      <FlexContainer>
        <ManifestEditorIcon />
        <Placeholder>
          {/* We need to decide what this should actually show */}
          {getTitle()}
        </Placeholder>
      </FlexContainer>
      <DropdownPreviewMenu
        onPreviewClick={() => saveManifest()}
        label={
          showAgain ? (
            `Preview: ${previewConfig[selectedPreviewIndex].label}`
          ) : (
            <a
              href={
                previewConfig[selectedPreviewIndex].baseUrl +
                persistedManifest.location
              }
              target={"_blank"}
              rel="noreferrer"
            >
              {`Preview: ${previewConfig[selectedPreviewIndex].label}`}
            </a>
          )
        }
        previewUrl={
          previewConfig[selectedPreviewIndex].baseUrl +
          persistedManifest.location
        }
        setSelectedPreviewIndex={(index: number) =>
          setSelectedPreviewIndex(index)
        }
        showAgain={showAgain}
        options={previewConfig}
      ></DropdownPreviewMenu>
    </ShellHeaderStrip>
  );
};
