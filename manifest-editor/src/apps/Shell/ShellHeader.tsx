import { useState } from "react";
import { ShellHeaderStrip } from "./ShellHeaderStrip";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { ManifestEditorIcon } from "../../icons/ManifestEditorIcon";
import { DropdownPreviewMenu } from "../../atoms/DropdownPreviewMenu";
import { PreviewModal } from "../../components/modals/PreviewModal";
import { Persistance } from "./Shell";
import { Button } from "../../atoms/Button";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { DownIcon } from "../../icons/DownIcon";
import { useApps } from "../../shell/AppContext/AppContext";
import { useProjectContext } from "@/shell/ProjectContext/ProjectContext";

export const ShellHeader: React.FC<{
  savePreviewLink: () => Promise<void>;
  showAgain: boolean;
  setSelectedPreviewIndex: (index: number) => void;
  previewConfig: any;
  selectedPreviewIndex: number;
  previewLocation: Persistance | undefined;
  showPreviewModal: boolean;
  setShowAgain: (show: boolean) => void;
  setShowPreviewModal: (show: boolean) => void;
}> = ({
  savePreviewLink,
  setSelectedPreviewIndex,
  previewConfig,
  selectedPreviewIndex,
  previewLocation,
  showPreviewModal,
  setShowAgain,
  showAgain,
  setShowPreviewModal,
}) => {
  const { current: currentProject } = useProjectContext();
  const { apps, changeApp, initialApp } = useApps();
  const [appMenuOpen, setAppMenuOpen] = useState(false);

  const getTitle = () => {
    if (currentProject) {
      return <h5>{currentProject.name}</h5>;
    }
    return <h5>IIIF Manifest Editor</h5>;
  };

  return (
    <>
      {showPreviewModal && previewLocation && (
        <PreviewModal
          manifest={previewLocation && previewLocation.location ? previewLocation.location : ""}
          link={previewConfig[selectedPreviewIndex].baseUrl + previewLocation.location}
          value={!showAgain}
          onChange={() => setShowAgain(!showAgain)}
          close={() => setShowPreviewModal(false)}
        />
      )}
      <ShellHeaderStrip>
        <FlexContainer>
          <Button onClick={() => changeApp(initialApp)} aria-label="Go to the homepage">
            <ManifestEditorIcon />
          </Button>
          <Dropdown>
            <Button aria-label="See app choices" onClick={() => setAppMenuOpen(!appMenuOpen)}>
              <DownIcon />
            </Button>
            {appMenuOpen && (
              <DropdownContent onMouseLeave={() => setAppMenuOpen(false)}>
                {Object.values(apps).map((app) => {
                  if (!currentProject && app.metadata.project) {
                    return null;
                  }

                  if (app.metadata.type === "launcher") {
                    return null;
                  }

                  return (
                    <Button
                      key={app.metadata.title}
                      onClick={() => {
                        setAppMenuOpen(!appMenuOpen);
                        changeApp({ id: app.metadata.id });
                      }}
                    >
                      {app.metadata.title}
                    </Button>
                  );
                })}
              </DropdownContent>
            )}
          </Dropdown>
          {getTitle()}
        </FlexContainer>
        {previewLocation && (
          <DropdownPreviewMenu
            onPreviewClick={() => savePreviewLink()}
            label={
              showAgain ? (
                `Preview: ${previewConfig[selectedPreviewIndex].label}`
              ) : (
                <a
                  href={previewConfig[selectedPreviewIndex].baseUrl + previewLocation.location}
                  target={"_blank"}
                  rel="noreferrer"
                >
                  {`Preview: ${previewConfig[selectedPreviewIndex].label}`}
                </a>
              )
            }
            previewUrl={previewConfig[selectedPreviewIndex].baseUrl + previewLocation.location}
            setSelectedPreviewIndex={(index: number) => setSelectedPreviewIndex(index)}
            showAgain={showAgain}
            options={previewConfig}
          />
        )}
      </ShellHeaderStrip>
    </>
  );
};
