import { useContext, useState } from "react";
import { useManifestEditor } from "../../apps/ManifestEditor/ManifestEditor.context";
import { TabPanel } from "../../components/layout/TabPanel";
import { DescriptiveForm } from "./DescriptiveForm";
import { LinkingForm } from "./LinkingForm";
import { MetadataForm } from "./MetadataForm";
import { StructuralForm } from "./StructuralForm";
import { TechnicalForm } from "./TechnicalForm";
import { useLayoutProvider } from "../../shell/Layout/Layout.context";

export const ManifestForm: React.FC<{ current: number; setCurrent: (idx: number) => void }> = ({
  current = 0,
  setCurrent,
}) => {
  return (
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
        {
          label: "Structural",
          component: <StructuralForm />,
        },
        // {
        //   label: "Annotations",
        //   component: <div>I will be the annotations panel</div>,
        // },
      ]}
      selected={current}
      switchPanel={setCurrent}
    />
  );
};
