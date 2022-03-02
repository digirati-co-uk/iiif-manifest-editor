import { useState, useEffect } from "react";
import { ShellHeaderStrip } from "./ShellHeaderStrip";
import { FlexContainer } from "../../layout/FlexContainer";
import { ManifestEditorIcon } from "../../icons/ManifestEditorIcon";
import { Placeholder } from "../../atoms/Placeholder";
import { DropdownPreviewMenu } from "../../atoms/DropdownPreviewMenu";
import { getValue } from "@iiif/vault-helpers";

import { useManifest } from "../../../hooks/useManifest";
import { PersistenceModal } from "../../modals/PersistenceModal";
import { Persistance } from "./Shell";

export const ShellHeader: React.FC<{
  saveManifest: () => Promise<void>;
  showAgain: boolean;
  setSelectedPreviewIndex: (index: number) => void;
  previewConfig: any;
  selectedPreviewIndex: number;
  persistedManifest: Persistance;
  showPreviewModal: boolean;
  setShowAgain: (show: boolean) => void;
  setShowPreviewModal: (show: boolean) => void;
}> = ({
  saveManifest,
  setSelectedPreviewIndex,
  previewConfig,
  selectedPreviewIndex,
  persistedManifest,
  showPreviewModal,
  setShowAgain,
  showAgain,
  setShowPreviewModal
}) => {
  const manifest = useManifest();

  const getTitle = () => {
    //  This needs to actually adapt for the specific content and default language
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
      {showPreviewModal && (
        <PersistenceModal
          manifest={
            persistedManifest && persistedManifest.location
              ? persistedManifest.location
              : ""
          }
          link={
            previewConfig[selectedPreviewIndex].baseUrl +
            persistedManifest.location
          }
          value={!showAgain}
          onChange={() => setShowAgain(!showAgain)}
          close={() => setShowPreviewModal(false)}
        />
      )}
      <ShellHeaderStrip>
        <FlexContainer>
          <ManifestEditorIcon />
          <Placeholder>{getTitle()}</Placeholder>
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
    </>
  );
};
