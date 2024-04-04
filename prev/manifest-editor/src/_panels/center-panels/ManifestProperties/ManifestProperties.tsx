import { ErrorBoundary } from "react-error-boundary";
import { TabPanel } from "@/components/layout/TabPanel";
import { DescriptiveForm } from "@/editors/ManifestProperties/DescriptiveForm";
import { LinkingForm } from "@/editors/ManifestProperties/LinkingForm";
import { MetadataForm } from "@/editors/ManifestProperties/MetadataForm";
import { TechnicalForm } from "@/editors/ManifestProperties/TechnicalForm";
import { useManifest } from "@/hooks/useManifest";

export const ManifestProperties: React.FC<{ current: number; setCurrent: (idx: number) => void }> = ({
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
        ]}
        selected={current}
        switchPanel={setCurrent}
      />
    </ErrorBoundary>
  );
};
