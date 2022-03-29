import { ManifestNormalized } from "@iiif/presentation-3";
import React from "react";

interface ShellContextInterface {
  selectedApplication: "ManifestEditor" | "Browser" | "Splash";
  changeSelectedApplication: (
    application: "ManifestEditor" | "Browser" | "Splash"
  ) => void;
  resourceID: string | null;
  changeResourceID: (id: string | null) => void;
  unsavedChanges: boolean;
  setUnsavedChanges: (bol: boolean) => void;
  updateRecentManifests: (manifest: string) => Promise<void>;
  recentManifests: ManifestNormalized[];
  newTemplates: any;
  setNewTemplates: (templates: any) => void;
  setCurrentCanvasId: (id: string) => void;
}

const ShellContext = React.createContext<ShellContextInterface | null>(null);

export default ShellContext;
