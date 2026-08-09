import { Button } from "@manifest-editor/ui/atoms/Button";
import { useMemo } from "react";
import { useManifest, useVault } from "react-iiif-vault";
import { useLayoutActions } from "../Layout/Layout.context";
import { CenterPanelContainer } from "@manifest-editor/ui/CenterPanelContainer";
import { Accordion } from "@manifest-editor/ui/atoms/Accordion";
import { copyToClipboard, createDownload, getExportVersion, serializeResource } from "../helpers";
import { DownloadIcon } from "@manifest-editor/ui/icons/DownloadIcon";
import { ButtonRow } from "@manifest-editor/ui/atoms/ButtonRow";

export interface ExportPanelProps {
  // We could limit versions / download options etc.
  initialVersion?: 2 | 3 | 4;
  versions?: Array<2 | 3 | 4>;
}

export function ExportPanel(props: ExportPanelProps) {
  const manifest = useManifest();
  const vault = useVault();
  const actions = useLayoutActions();
  const requiresPresentation4 = useMemo(() => getExportVersion(vault as any, manifest as any) === 4, [manifest, vault]);

  const version3 = useMemo(() => {
    return requiresPresentation4 ? "" : JSON.stringify(vault.toPresentation3(manifest as any), null, 2);
  }, [manifest, requiresPresentation4, vault]);

  const version2 = useMemo(() => {
    return requiresPresentation4 ? "" : JSON.stringify(vault.toPresentation2(manifest as any), null, 2);
  }, [manifest, requiresPresentation4, vault]);

  const version4 = useMemo(() => {
    return JSON.stringify(serializeResource(vault as any, manifest as any, 4), null, 2);
  }, [manifest, vault]);

  return (
    <CenterPanelContainer title="Export manifest" close={actions.centerPanel.popStack}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Accordion
          items={[
            {
              label: "Presentation 4",
              description: 'Download this version by clicking the "Download" button.',
              maxHeight: 400,
              large: true,
              initialOpen: props.initialVersion === 4 || requiresPresentation4,
              overflow: true,
              icon: (
                <Button onClick={() => createDownload(version4, "manifest-v4.json")}>
                  <DownloadIcon />
                </Button>
              ),
              children: (
                <div style={{ maxWidth: "100%" }}>
                  <pre style={{ whiteSpace: "pre-wrap" }}>{version4}</pre>
                  <ButtonRow data-sticky="true">
                    <Button onClick={() => copyToClipboard(version4)}>Copy to clipboard</Button>
                    <Button onClick={() => createDownload(version4, "manifest-v4.json")}>Download</Button>
                  </ButtonRow>
                </div>
              ),
            },
            ...(!requiresPresentation4
              ? [
                  {
                    label: "Presentation 3",
                    description: 'Download this version by clicking the "Download" button.',
                    maxHeight: 400,
                    large: true,
                    initialOpen: props.initialVersion !== 4,
                    overflow: true,
                    icon: (
                      <Button onClick={() => createDownload(version3, "manifest.json")}>
                        <DownloadIcon />
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
                  {
                    label: "Presentation 2",
                    description: 'Download this version by clicking the "Download" button.',
                    maxHeight: 400,
                    large: true,
                    icon: (
                      <Button onClick={() => createDownload(version2, "manifest.json")}>
                        <DownloadIcon />
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
                  },
                ]
              : []),
          ]}
        />
      </div>
    </CenterPanelContainer>
  );
}
