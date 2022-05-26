import { TabPanel } from "../../components/layout/TabPanel";
import { DescriptiveForm } from "./DescriptiveForm";
import { LinkingForm } from "./LinkingForm";
import { MetadataForm } from "./MetadataForm";
import { StructuralForm } from "./StructuralForm";
import { TechnicalForm } from "./TechnicalForm";
import { ErrorBoundary } from "react-error-boundary";
import { useManifest } from "../../hooks/useManifest";

export const ManifestForm: React.FC<{ current: number; setCurrent: (idx: number) => void }> = ({
  current = 0,
  setCurrent,
}) => {
  const manifest = useManifest();

  if (!manifest) {
    return null;
  }

  return (
    <ErrorBoundary fallback={<div />} resetKeys={[manifest]}>
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
    </ErrorBoundary>
  );
};
