import { CanvasContext, useCanvas } from "react-iiif-vault";
import { TabPanel } from "../../components/layout/TabPanel";
import { AnnotationForm } from "./AnnotationForm";
import { DescriptiveForm } from "./DescriptiveForm";
import { LinkingForm } from "./LinkingForm";
import { MediaForm } from "./MediaForm";
import { MetadataForm } from "./MetadataForm";
import { TechnicalForm } from "./TechnicalForm";
import { CanvasMedia as CanvasMediaPanel } from "@/_panels/right-panels/CanvasMedia/CanvasMedia";
import { useLayoutActions } from "@/shell/Layout/Layout.context";

export const CanvasForm: React.FC<{ current: number; setCurrent: (idx: number) => void }> = ({
  current = 0,
  setCurrent,
}) => {
  const canvas = useCanvas();
  const { stack } = useLayoutActions();

  return (
    <>
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
            component: (
              <CanvasMediaPanel
                onClickAnnotation={(annotation) => stack("canvas-media", { annotation: annotation.id })}
                onAddMedia={() => stack("create-painting-annotation")}
              />
            ),
          },
          // {
          //   label: "Linking",
          //   component: <LinkingForm />,
          // },
          {
            label: "Technical",
            component: <TechnicalForm />,
          },
          // {
          //   label: "Annotations",
          //   component: <AnnotationForm />,
          // },
        ]}
        selected={current}
        switchPanel={setCurrent}
        key={canvas?.id}
      />
    </>
  );
};
