import { useState } from "react";
import { TabPanel } from "../../layout/TabPanel";
import { DescriptiveForm } from "./DescriptiveForm";
// import { TechnicalForm } from "./TechnicalForm";

export const CanvasForm = () => {
  const [selectedPanel, setSeletedPanel] = useState(0);

  return (
    <TabPanel
      menu={[
        {
          label: "Descriptive",
          component: <DescriptiveForm />,
        },
        // {
        //   label: "Metadata",
        //   component: <div>I will be the metadata panel</div>,
        // },
        // {
        //   label: "Linking",
        //   component: <div>I will be the linking panel</div>,
        // },
        // {
        //   label: "Technical",
        //   component: <TechnicalForm />,
        // },
        // {
        //   label: "Structural",
        //   component: <div>I will be the structural panel</div>,
        // },
        // {
        //   label: "Annotations",
        //   component: <div>I will be the annotations panel</div>,
        // },
      ]}
      switchPanel={(idx: number) => setSeletedPanel(idx)}
      selected={selectedPanel}
    />
  );
};
