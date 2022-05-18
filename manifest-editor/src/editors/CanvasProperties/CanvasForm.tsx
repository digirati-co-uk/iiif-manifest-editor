import { useContext } from "react";
import { useCanvas } from "react-iiif-vault";
import ManifestEditorContext from "../../apps/ManifestEditor/ManifestEditorContext";
import { TabPanel } from "../../components/layout/TabPanel";
import { AnnotationForm } from "./AnnotationForm";
import { DescriptiveForm } from "./DescriptiveForm";
import { LinkingForm } from "./LinkingForm";
import { MediaForm } from "./MediaForm";
import { MetadataForm } from "./MetadataForm";
import { TechnicalForm } from "./TechnicalForm";

export const CanvasForm = () => {
  const editorContext = useContext(ManifestEditorContext);

  const canvas = useCanvas();

  return (
    <>
      <small>CanvasID: {canvas?.id}</small>
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
            label: "Media",
            component: <MediaForm />,
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
            label: "Annotations",
            component: <AnnotationForm />,
          },
        ]}
        switchPanel={(idx) => editorContext?.changeSelectedProperty("canvas", idx)}
        selected={editorContext?.selectedPanel || 0}
        key={canvas?.id}
      />
    </>
  );
};
