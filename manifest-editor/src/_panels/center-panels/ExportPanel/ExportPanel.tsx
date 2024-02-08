import { useManifest } from "@/hooks/useManifest";
import { useCollection, useVault } from "react-iiif-vault";
import { useApps, useEditingResource, useLayoutActions } from "@/shell";
import { Button } from "@/atoms/Button";
import { CenterPanelContainer } from "@/_components/ui/CenterPanelContainer/CenterPanelContainer";
import { Accordion } from "@/components/layout/Accordion/Accordion";
import downloadIcon from "@/icons/DownloadIcon.svg";
import { ButtonRow } from "@/atoms/ButtonRow";
import { useMemo } from "react";
import { createDownload } from "@/helpers/create-download";
import { copyToClipboard } from "@/helpers/copy-to-clipboard";

export interface ExportPanelProps {
  // We could limit versions / download options etc.
  initialVersion?: 2 | 3;
  versions?: Array<2 | 3>;
}

export function ExportPanel(props: ExportPanelProps) {
  const { apps, currentApp } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;

  const isCollection = selectedApp?.metadata.projectType === "Collection";

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const manifest = isCollection ? useCollection({} as any) : useManifest();
  const vault = useVault();
  const actions = useLayoutActions();

  const version3 = useMemo(() => {
    return JSON.stringify(vault.toPresentation3(manifest as any), null, 2);
  }, [manifest, vault]);

  const version2 = useMemo(() => {
    return JSON.stringify(vault.toPresentation2(manifest as any), null, 2);
  }, [manifest, vault]);

  return (
    <CenterPanelContainer title="Export manifest" close={actions.centerPanel.popStack}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Accordion
          items={
            [
              {
                label: "Presentation 3",
                description: 'Download this version by clicking the "Download" button.',
                maxHeight: 400,
                large: true,
                initialOpen: true,
                overflow: true,
                icon: (
                  <Button onClick={() => createDownload(version3, "manifest.json")}>
                    <img width={24} alt="" src={downloadIcon} />
                  </Button>
                ),
                children: (
                  <div style={{ maxWidth: "100%" }}>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(vault.toPresentation3(manifest as any), null, 2)}
                    </pre>
                    <ButtonRow data-sticky="true">
                      <Button onClick={() => copyToClipboard(version3)}>Copy to clipboard</Button>
                      <Button onClick={() => createDownload(version3, "manifest.json")}>Download</Button>
                    </ButtonRow>
                  </div>
                ),
              },
              !isCollection
                ? {
                    label: "Presentation 2",
                    description: 'Download this version by clicking the "Download" button.',
                    maxHeight: 400,
                    large: true,
                    icon: (
                      <Button onClick={() => createDownload(version2, "manifest.json")}>
                        <img width={24} alt="" src={downloadIcon} />
                      </Button>
                    ),
                    children: (
                      <div style={{ maxWidth: "100%" }}>
                        <pre style={{ whiteSpace: "pre-wrap" }}>
                          {JSON.stringify(vault.toPresentation2(manifest as any), null, 2)}
                        </pre>
                        <ButtonRow data-sticky="true">
                          <Button onClick={() => copyToClipboard(version2)}>Copy to clipboard</Button>
                          <Button onClick={() => createDownload(version2, "manifest.json")}>Download</Button>
                        </ButtonRow>
                      </div>
                    ),
                  }
                : null,
            ].filter(Boolean) as any
          }
        />
      </div>
    </CenterPanelContainer>
  );
}
