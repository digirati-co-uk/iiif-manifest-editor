import { useTranslations } from "@manifest-editor/i18n";
import { useApps, useLayoutActions } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { Dropdown, DropdownContent } from "@manifest-editor/ui/atoms/Dropdown";
import { useState } from "react";
import { ModalButton } from "@manifest-editor/ui/madoc/components/ModalButton";
import { NewManifestModal } from "./NewManifestModal";

export const ShellOptions: React.FC<{}> = () => {
  const webT = useTranslations("web");

  const { changeApp } = useApps();
  const actions = useLayoutActions();

  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <div className="flex">
        <Dropdown onMouseLeave={() => setFileOpen(false)}>
          <Button aria-label={webT("legacy.fileMenu")} onClick={() => setFileOpen(!fileOpen)}>
            {webT("legacy.file")}
          </Button>
          <div style={fileOpen ? { opacity: 1, pointerEvents: "visible" } : { visibility: "hidden", opacity: 0 }}>
            <DropdownContent onMouseLeave={() => setFileOpen(false)}>
              <ModalButton
                as={Button}
                aria-label={webT("legacy.newManifest")}
                title={webT("legacy.newManifest")}
                modalSize="lg"
                onOpen={() => setFileOpen(false)}
                render={(props) => <NewManifestModal {...props} />}
              >
                {webT("actions.new")}
              </ModalButton>
              <Button
                onClick={() => {
                  setFileOpen(false);
                  changeApp({ id: "splash" });
                }}
                aria-label={webT("legacy.load")}
                title={webT("legacy.load")}
                color={"#6b6b6b"}
              >
                {webT("actions.open")}
              </Button>

              <Button
                onClick={() => {
                  actions.open({ id: "export", stacked: true });
                }}
                aria-label={webT("legacy.exportJson")}
                title={webT("legacy.exportJson")}
                color={"#6b6b6b"}
              >
                {webT("settings.export")}
              </Button>
            </DropdownContent>
          </div>
        </Dropdown>
        <Dropdown onMouseLeave={() => setHelpOpen(false)}>
          <Button aria-label={webT("legacy.helpMenu")} onClick={() => setHelpOpen(!helpOpen)}>
            {webT("legacy.help")}
          </Button>
          {helpOpen && (
            <DropdownContent>
              <Button
                aria-label={webT("legacy.about")}
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  changeApp({ id: "about" });
                }}
              >
                {webT("legacy.about")}
              </Button>
            </DropdownContent>
          )}
        </Dropdown>
      </div>
    </>
  );
};
