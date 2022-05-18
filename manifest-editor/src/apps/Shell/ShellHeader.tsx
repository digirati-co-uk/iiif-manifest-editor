import { useContext, useState } from "react";

import { ShellHeaderStrip } from "./ShellHeaderStrip";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { ManifestEditorIcon } from "../../icons/ManifestEditorIcon";
import { DropdownPreviewMenu } from "../../atoms/DropdownPreviewMenu";
import { useManifest } from "../../hooks/useManifest";
import { PreviewModal } from "../../components/modals/PreviewModal";
import { Persistance } from "./Shell";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { DownIcon } from "../../icons/DownIcon";

import { getValue } from "@iiif/vault-helpers";
import ShellContext from "./ShellContext";

export const ShellHeader: React.FC<{
  savePreviewLink: () => Promise<void>;
  showAgain: boolean;
  setSelectedPreviewIndex: (index: number) => void;
  previewConfig: any;
  selectedPreviewIndex: number;
  previewLocation: Persistance | undefined;
  showPreviewModal: boolean;
  setShowAgain: (show: boolean) => void;
  setShowPreviewModal: (show: boolean) => void;
}> = ({
  savePreviewLink,
  setSelectedPreviewIndex,
  previewConfig,
  selectedPreviewIndex,
  previewLocation,
  showPreviewModal,
  setShowAgain,
  showAgain,
  setShowPreviewModal,
}) => {
  const manifest = useManifest();
  const [appMenuOpen, setAppMenuOpen] = useState(false);
  const shellContext = useContext(ShellContext);

  const getTitle = () => {
    if (manifest) {
      return (
        <h5>
          IIIF {manifest.type} : {getValue(manifest.label)}
        </h5>
      );
    }
    return <h5>IIIF Manifest Editor</h5>;
  };

  return (
    <>
      {showPreviewModal && previewLocation && (
        <PreviewModal
          manifest={previewLocation && previewLocation.location ? previewLocation.location : ""}
          link={previewConfig[selectedPreviewIndex].baseUrl + previewLocation.location}
          value={!showAgain}
          onChange={() => setShowAgain(!showAgain)}
          close={() => setShowPreviewModal(false)}
        />
      )}
      <ShellHeaderStrip>
        <FlexContainer>
          <Button onClick={() => shellContext?.changeSelectedApplication("Splash")} aria-label="Go to the homepage">
            <ManifestEditorIcon />
          </Button>
          <Dropdown>
            <Button aria-label="See app choices" onClick={() => setAppMenuOpen(!appMenuOpen)}>
              <DownIcon />
            </Button>
            {appMenuOpen && (
              <DropdownContent onMouseLeave={() => setAppMenuOpen(false)}>
                <Button
                  onClick={() => {
                    setAppMenuOpen(!appMenuOpen);
                    shellContext?.changeSelectedApplication("ManifestEditor");
                  }}
                  title="Open the Manifest Editor"
                  aria-label="Open the manifest editor"
                >
                  Manifest Editor
                </Button>
                <Button
                  onClick={() => {
                    setAppMenuOpen(!appMenuOpen);
                    shellContext?.changeSelectedApplication("Browser");
                  }}
                  title="Open the IIIF Browser"
                  aria-label="Open the IIIF browser"
                >
                  IIIF Browser
                </Button>
              </DropdownContent>
            )}
          </Dropdown>
          {getTitle()}
        </FlexContainer>
        {previewLocation && (
          <DropdownPreviewMenu
            onPreviewClick={() => savePreviewLink()}
            label={
              showAgain ? (
                `Preview: ${previewConfig[selectedPreviewIndex].label}`
              ) : (
                <a
                  href={previewConfig[selectedPreviewIndex].baseUrl + previewLocation.location}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  {`Preview: ${previewConfig[selectedPreviewIndex].label}`}
                </a>
              )
            }
            previewUrl={previewConfig[selectedPreviewIndex].baseUrl + previewLocation.location}
            setSelectedPreviewIndex={(index: number) => setSelectedPreviewIndex(index)}
            showAgain={showAgain}
            options={previewConfig}
          />
        )}
      </ShellHeaderStrip>
    </>
  );
};
