import { useContext, useState } from "react";
import { useCanvas } from "react-iiif-vault";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { TabPanel } from "../../layout/TabPanel";
import { DescriptiveForm } from "./DescriptiveForm";
import { LinkingForm } from "./LinkingForm";
import { MetadataForm } from "./MetadataForm";
import { TechnicalForm } from "./TechnicalForm";
// import { TechnicalForm } from "./TechnicalForm";

export const CanvasForm = () => {
  const editorContext = useContext(ManifestEditorContext);

  const canvas = useCanvas();

  return (
    <>
      {/* <small>CanvasID: {canvas?.id}</small> */}
      <TabPanel
        menu={[
          {
            label: "Descriptive",
            component: <DescriptiveForm />,
          },
          {
            label: "Metadata",
            component: <MetadataForm />,
          },
          {
            label: "Linking",
            component: <LinkingForm />,
          },
          {
            label: "Technical",
            component: <TechnicalForm />,
          },
          // {
          //   label: "Structural",
          //   component: <div>I will be the structural panel</div>,
          // },
          // {
          //   label: "Annotations",
          //   component: <div>I will be the annotations panel</div>,
          // },
        ]}
        switchPanel={(idx) =>
          editorContext?.changeSelectedProperty("canvas", idx)
        }
        selected={editorContext?.selectedPanel || 0}
        key={canvas?.id}
      />
    </>
  );
};
