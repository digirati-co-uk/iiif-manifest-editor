import { ShellHeader } from "./ShellHeader";
import { ShellOptions } from "./ShellOptions";
import { ShellToolbar } from "./ShellToolbar";

// Temporary code until big fixed on react-iiif-vault
import { serialize, serializeConfigPresentation3 } from "@iiif/parser";
import { useState, useEffect } from "react";

import { useVault } from "react-iiif-vault";
import { useSave } from "../../../hooks/useSave";
import { usePermalink } from "../../../hooks/useSave";
import { useManifest } from "../../../hooks/useManifest";

export type Persistance = {
  deleteLocation?: string;
  expirationTtl?: Number;
  location?: string;
  updateLocation?: string;
};

export const Shell: React.FC<{
  previewConfig: any;
  setView: (view: "thumbnails" | "tree") => void;
  changeSampleManifest: (newId: string) => void;
}> = ({ previewConfig, setView, changeSampleManifest }) => {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [persistedManifest, setpersistedManifest] = useState<
    Persistance | undefined
  >({});
  const [manifestPermalink, setManifestPermalink] = useState<
    Persistance | undefined
  >();
  const [showAgain, setShowAgain] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previouslySaved, setPreviouslySaved] = useState(false);

  const manifest = useManifest();
  const vault = useVault();

  useEffect(() => {
    // We want to hold on to the persisted value in localStorage
    // TODO handle the time constraint on this value
    localStorage.setItem(
      "persistedManifest",
      JSON.stringify(persistedManifest)
    );
  }, [persistedManifest]);

  useEffect(() => {
    // We want to hold on to the persisted value in localStorage
    if (manifestPermalink) {
      localStorage.setItem(
        "manifestPermalink",
        JSON.stringify(manifestPermalink)
      );
    }
  }, [manifestPermalink]);

  useEffect(() => {
    // We want to hold on to the prefered viewer choice in localstorage
    localStorage.setItem("previewChoice", JSON.stringify(selectedPreviewIndex));
  }, [selectedPreviewIndex]);

  useEffect(() => {
    if (localStorage.getItem("persistedManifest")) {
      const pers = localStorage.getItem("persistedManifest")
        ? JSON.parse(localStorage.getItem("persistedManifest") || "{}")
        : {};
      setpersistedManifest(pers);
    }
    if (localStorage.getItem("previewChoice")) {
      const preview = localStorage.getItem("previewChoice")
        ? JSON.parse(localStorage.getItem("previewChoice") || "{}")
        : {};
      setSelectedPreviewIndex(preview);
    }
    if (localStorage.getItem("manifestPermalink")) {
      const permalink = localStorage.getItem("manifestPermalink")
        ? JSON.parse(localStorage.getItem("manifestPermalink") || "{}")
        : undefined;
      setManifestPermalink(permalink);
      setPreviouslySaved(true);
    }
  }, []);

  const saveManifest = async () => {
    if (manifest) {
      // Temporary code until bug fixed on react-iiif-vault
      const man = await serialize(
        vault.getState().iiif,
        manifest,
        serializeConfigPresentation3
      );
      // const manifestToPersist = await vault.toPresentation3(manifest)
      const data = await useSave(man);
      setpersistedManifest(data ? data : "");
      if (showAgain) setShowPreviewModal(true);
    }
  };

  const savePermalink = async () => {
    if (manifest) {
      // Temporary code until bug fixed on react-iiif-vault
      const man = await serialize(
        vault.getState().iiif,
        manifest,
        serializeConfigPresentation3
      );
      // const manifestToPersist = await vault.toPresentation3(manifest)
      const perma = await usePermalink(man);
      setManifestPermalink(perma ? perma : undefined);
    }
  };

  return (
    <>
      <ShellHeader
        saveManifest={saveManifest}
        showAgain={showAgain}
        setSelectedPreviewIndex={setSelectedPreviewIndex}
        previewConfig={previewConfig}
        selectedPreviewIndex={selectedPreviewIndex}
        persistedManifest={persistedManifest}
        showPreviewModal={showPreviewModal}
        setShowAgain={setShowAgain}
        setShowPreviewModal={setShowPreviewModal}
      />
      <ShellToolbar>
        <ShellOptions
          changeManifest={(url: string) => changeSampleManifest(url)}
          // This is the 48hr persistence
          saveManifest={saveManifest}
          // This is the permalink
          savePermalink={savePermalink}
          previouslySaved={previouslySaved}
          setView={(view: "thumbnails" | "tree") => setView(view)}
        />
      </ShellToolbar>
    </>
  );
};
