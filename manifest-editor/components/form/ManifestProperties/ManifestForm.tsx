import { useContext } from "react";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { TabPanel } from "../../layout/TabPanel";
import { DescriptiveForm } from "./DescriptiveForm";
import { LinkingForm } from "./LinkingForm";
import { MetadataForm } from "./MetadataForm";
import { StructuralForm } from "./StructuralForm";
import { TechnicalForm } from "./TechnicalForm";

export const ManifestForm: React.FC<{}> = () => {
  const editorContext = useContext(ManifestEditorContext);

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
      switchPanel={(idx) =>
        editorContext?.changeSelectedProperty("manifest", idx)
      }
      selected={editorContext?.selectedPanel || 0}
    />
  );
};
