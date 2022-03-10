import { useState, useEffect } from "react";
import { AddManifestModal } from "../../modals/AddManifestModal";
import { Button } from "../../atoms/Button";
import { useManifest } from "../../../hooks/useManifest";
import { SaveModal } from "../../modals/SaveModal";
import { Dropdown, DropdownContent } from "../../atoms/Dropdown";
import { ExportModal } from "../../modals/ExportModal";
import { FlexContainer } from "../../layout/FlexContainer";

export const ShellOptions: React.FC<{
  saveManifest: () => void;
  savePermalink: () => void;
  previouslySaved: boolean;
  permalink: string | undefined;
  saveAsChoice: number;
  setSaveAsChoice: (number: number) => void;
}> = ({
  saveManifest,
  savePermalink,
  previouslySaved,
  permalink,
  saveAsChoice,
  setSaveAsChoice
}) => {
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);


  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const manifest = useManifest();

  useEffect(() => {
    setaddModalVisible(false);
  }, [manifest]);

  return (
    <>
      {addModalVisible && (
        <AddManifestModal
          manifest={manifest ? manifest?.id : ""}
          close={() => setaddModalVisible(false)}
        />
      )}
      {saveModalVisible && (
        <SaveModal
          close={() => setSaveModalVisible(false)}
          savePermalink={savePermalink}
          previouslySaved={previouslySaved}
          permalink={permalink}
          saveAsChoice={saveAsChoice}
          setSaveAsChoice={setSaveAsChoice}
        />
      )}
      {exportModalVisible && (
        <ExportModal close={() => setExportModalVisible(false)} />
      )}
      <FlexContainer>
        <Dropdown>
          <Button onClick={() => setFileOpen(!fileOpen)}>File</Button>
          {fileOpen && (
            <DropdownContent onMouseLeave={() => setFileOpen(false)}>
              <Button
                onClick={() => setaddModalVisible(!addModalVisible)}
                title="Add an existing manifest to get started"
                color={"#6b6b6b"}
              >
                Open
              </Button>
              <Button
                onClick={() => {
                  setFileOpen(!fileOpen);
                  saveManifest();
                }}
              >
                Save
              </Button>
              <Button
                onClick={() => {
                  setFileOpen(!fileOpen);
                  setSaveModalVisible(!saveModalVisible);
                }}
              >
                Save as...
              </Button>
              <Button
                onClick={() => {
                  setFileOpen(!fileOpen);
                  setExportModalVisible(!exportModalVisible);
                }}
              >
                Export
              </Button>
            </DropdownContent>
          )}
        </Dropdown>
        <Dropdown onMouseLeave={() => setHelpOpen(false)}>
          <Button onClick={() => setHelpOpen(!helpOpen)}>Help</Button>
          {helpOpen && (
            <DropdownContent>
              <Button
                onClick={() => {
                  setHelpOpen(!helpOpen);
                  alert("About clicked");
                }}
              >
                About
              </Button>
            </DropdownContent>
          )}
        </Dropdown>
      </FlexContainer>
    </>
  );
};
