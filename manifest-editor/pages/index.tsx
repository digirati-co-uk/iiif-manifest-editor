import { useState, useEffect } from "react";
import { NextPage } from "next";
import Head from "next/head";

import styles from "../styles/Home.module.css";
import { Button } from "../components/atoms/Button";
import { CanvasView } from "../components/organisms/CanvasView";
import { Toolbar } from "../components/layout/Toolbar";
import { FlexContainerRow } from "../components/layout/FlexContainer";
import { EditorPanel } from "../components/layout/EditorPanel";
import { ShellToolbar } from "../components/molecules/ShellToolbar";
import { ShellOptions } from "../components/apps/Shell/ShellOptions";
import { ShellHeader } from "../components/apps/Shell/ShellHeader";
import { ContentSelector } from "../components/layout/ContentSelector";

import { useVault } from "react-iiif-vault";
import { useManifest } from "../hooks/useManifest";
import { useSave } from "../hooks/useSave";

// Temporary code until big fixed on react-iiif-vault
import { serialize, serializeConfigPresentation3 } from "@iiif/parser";
import { PersistenceModal } from "../components/molecules/PersistenceModal";

import data from "../config.json";
import ManifestEditorContext from "../components/apps/ManifestEditor/ManifestEditorContext";

export type Persistance = {
  deleteLocation?: string;
  expirationTtl?: Number;
  location?: string;
  updateLocation?: string;
};

export const getStaticProps = async () => {
  return {
    props: {
      config: data
    }
  };
};

const Home: NextPage = (props: any) => {
  const vault = useVault();
  const manifest = useManifest();
  const [selectedProperty, setSelectedProperty] = useState(0);

  const changeSelectedProperty = () => {
    setSelectedProperty(selectedProperty + 1);
  };

  const editorSettings = { selectedProperty, changeSelectedProperty };

  const [editorPanelOpen, setEditorPanelOpen] = useState(false);
  const [persistedManifest, setpersistedManifest] = useState<Persistance>({});
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAgain, setShowAgain] = useState(true);
  const [view, setView] = useState<"thumbnails" | "tree">("tree");

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
  }, []);

  useEffect(() => {
    // We want to hold on to the prefered viewer choice in localstorage
    localStorage.setItem("previewChoice", JSON.stringify(selectedPreviewIndex));
  }, [selectedPreviewIndex]);

  useEffect(() => {
    // We want to hold on to the persisted value in localStorage
    // TODO handle the time constraint on this value
    localStorage.setItem(
      "persistedManifest",
      JSON.stringify(persistedManifest)
    );
  }, [persistedManifest]);

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

  return (
    <div className={styles.container}>
      <Head>
        <title>Manifest Editor</title>
        <meta name="description" content="IIIF Manifest Editor" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {showPreviewModal ? (
        <PersistenceModal
          manifest={
            persistedManifest && persistedManifest.location
              ? persistedManifest.location
              : ""
          }
          link={
            props.config.preview[selectedPreviewIndex].baseUrl +
            persistedManifest.location
          }
          value={!showAgain}
          onChange={() => setShowAgain(!showAgain)}
          close={() => setShowPreviewModal(false)}
        />
      ) : (
        <></>
      )}
      <main className={styles.main}>
        <ManifestEditorContext.Provider value={editorSettings}>
          <ShellHeader
            saveManifest={saveManifest}
            showAgain={showAgain}
            setSelectedPreviewIndex={setSelectedPreviewIndex}
            previewConfig={props.config.preview}
            selectedPreviewIndex={selectedPreviewIndex}
            persistedManifest={persistedManifest}
          />
          <ShellToolbar>
            <ShellOptions
              changeManifest={(url: string) => props.changeSampleManifest(url)}
              saveManifest={saveManifest}
              setView={(view: "thumbnails" | "tree") => setView(view)}
            />
          </ShellToolbar>
          <Toolbar>
            <Button
              // This will change but just to get some MVP
              onClick={() => setEditorPanelOpen(true)}
              title="Edit manifest label"
            >
              Edit Manifest Label
            </Button>
          </Toolbar>
          <FlexContainerRow>
            <ContentSelector view={view} />
            <CanvasView manifest={manifest ? manifest?.id : ""} />
            <EditorPanel
              // Hard coded value here but this will depend on the element being edited
              title={"Edit manifest"}
              open={editorPanelOpen}
              close={() => setEditorPanelOpen(false)}
              languages={props.config.defaultLanguages}
            ></EditorPanel>
          </FlexContainerRow>
        </ManifestEditorContext.Provider>
      </main>

      <footer className={styles.footer}>
        Your manifest is saved here: {persistedManifest.location}
      </footer>
    </div>
  );
};

export default Home;
