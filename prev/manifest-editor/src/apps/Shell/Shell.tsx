import { ShellHeader } from "./ShellHeader";
import { ShellOptions } from "./ShellOptions";
import { ShellToolbar } from "./ShellToolbar";
import { useState } from "react";
import { useProjectContext } from "@/shell";

export type Persistance = {
  deleteLocation?: string;
  expirationTtl?: number;
  location?: string;
  updateLocation?: string;
};

export const Shell: React.FC<{
  previewConfig?: any;
}> = ({ previewConfig }) => {
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const [saveAsChoice, setSaveAsChoice] = useState(1);

  const [showAgain, setShowAgain] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { actions, current } = useProjectContext();

  const savePreviewLink = async () => {
    //
  };

  return (
    <>
      <ShellHeader
        savePreviewLink={savePreviewLink}
        showAgain={false}
        setSelectedPreviewIndex={setSelectedPreviewIndex}
        previewConfig={previewConfig}
        selectedPreviewIndex={0}
        previewLocation={undefined}
        showPreviewModal={false}
        setShowAgain={setShowAgain}
        setShowPreviewModal={setShowPreviewModal}
      />
      <ShellToolbar>
        <ShellOptions
          save={current ? () => actions.saveProject(current) : null}
          previouslySaved={false}
          permalink={""}
          saveAsChoice={0}
          setSaveAsChoice={setSaveAsChoice}
          forceShowModal={false}
          setForceShowModal={setShowSaveModal}
        />
      </ShellToolbar>
    </>
  );
};
