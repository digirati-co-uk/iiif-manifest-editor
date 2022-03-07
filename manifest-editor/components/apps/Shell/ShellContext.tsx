import React from "react";

interface ShellContextInterface {
  selectedApplication: "ManifestEditor" | "Browser";
  changeSelectedApplication: (
    application: "ManifestEditor" | "Browser"
  ) => void;
}

const ShellContext = React.createContext<ShellContextInterface | null>(null);

export default ShellContext;
