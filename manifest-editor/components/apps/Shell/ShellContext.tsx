import React from "react";

interface ShellContextInterface {
  selectedApplication: "ManifestEditor" | "Browser";
  changeSelectedApplication: (
    application: "ManifestEditor" | "Browser"
  ) => void;
  resourceID: string | null;
  changeResourceID: (id: string | null) => void;
  unsavedChanges: boolean;
  setUnsavedChanges: (bol: boolean) => void;
}

const ShellContext = React.createContext<ShellContextInterface | null>(null);

export default ShellContext;
