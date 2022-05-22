import { useContext } from "react";
import { ShellHeader } from "./ShellHeader";
import { ShellOptions } from "./ShellOptions";
import { ShellToolbar } from "./ShellToolbar";

// Temporary code until big fixed on react-iiif-vault
import { serialize, serializeConfigPresentation3 } from "@iiif/parser";
import { useState, useEffect } from "react";

import { useVault } from "react-iiif-vault";
import { usePreviewLink, useUpdatePermalink } from "../../hooks/useSave";
import { usePermalink } from "../../hooks/useSave";
import { useManifest } from "../../hooks/useManifest";
import { useShell } from "../../context/ShellContext/ShellContext";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";
import { Button } from "../../atoms/Button";
import { useProjectContext } from "../../shell/ProjectContext/ProjectContext";

export type Persistance = {
  deleteLocation?: string;
  expirationTtl?: number;
  location?: string;
  updateLocation?: string;
};

export const Shell: React.FC<{
  previewConfig: any;
  newTemplates: any;
}> = ({ previewConfig, newTemplates }) => {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  // 48 hours link preview link
  const [previewLocation, setPreviewLocation] = useState<Persistance | undefined>({});
  // Permalink
  const [manifestPermalink, setManifestPermalink] = useState<Persistance | undefined>();
  // This is an index of the list of choices,
  // 0 is replace, 1 is create new - default is to create new
  // 2 if local storage
  const [saveAsChoice, setSaveAsChoice] = useState(1);

  const [showAgain, setShowAgain] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previouslySaved, setPreviouslySaved] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const shellContext = useShell();
  const { actions, current } = useProjectContext();

  const manifest = useManifest();
  const vault = useVault();

  useEffect(() => {
    // We want to hold on to the prefered viewer choice in localstorage
    localStorage.setItem("previewChoice", JSON.stringify(selectedPreviewIndex));
  }, [selectedPreviewIndex]);

  useEffect(() => {
    shellContext.setNewTemplates(JSON.parse(newTemplates));
  }, []);

  useEffect(() => {
    // previewchoice in localStorage?
    if (localStorage.getItem("previewChoice")) {
      const preview = localStorage.getItem("previewChoice")
        ? JSON.parse(localStorage.getItem("previewChoice") || "{}")
        : {};
      setSelectedPreviewIndex(preview);
    }
  }, []);

  // Save the manifest to a preview location for 48 hours
  const savePreviewLink = async () => {
    if (manifest) {
      // Temporary code until bug fixed on react-iiif-vault
      const man = await serialize(vault.getState().iiif, manifest, serializeConfigPresentation3);
      // const manifestToPersist = await vault.toPresentation3(manifest)
      const data = await usePreviewLink(man);
      setPreviewLocation(data ? data : "");
      if (showAgain) {
        setShowPreviewModal(true);
      }
    }
  };

  useEffect(() => {
    if (manifestPermalink && manifestPermalink.location) {
      shellContext.changeResourceID(manifestPermalink.location);
    }
  }, [manifestPermalink]);

  return (
    <>
      <ShellHeader
        savePreviewLink={savePreviewLink}
        showAgain={showAgain}
        setSelectedPreviewIndex={setSelectedPreviewIndex}
        previewConfig={previewConfig}
        selectedPreviewIndex={selectedPreviewIndex}
        previewLocation={previewLocation}
        showPreviewModal={showPreviewModal}
        setShowAgain={setShowAgain}
        setShowPreviewModal={setShowPreviewModal}
      />
      <ShellToolbar>
        <ShellOptions
          save={current ? () => actions.saveProject(current) : null}
          previouslySaved={previouslySaved}
          permalink={manifestPermalink?.location}
          saveAsChoice={saveAsChoice}
          setSaveAsChoice={setSaveAsChoice}
          forceShowModal={showSaveModal}
          setForceShowModal={setShowSaveModal}
        />
      </ShellToolbar>
    </>
  );
};
