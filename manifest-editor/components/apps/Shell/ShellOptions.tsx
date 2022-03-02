import { useState, useEffect } from "react";
import styled from "styled-components";
import { AddManifestModal } from "../../modals/AddManifestModal";
import { Button } from "../../atoms/Button";
import { useManifest } from "../../../hooks/useManifest";
import { SaveModal } from "../../modals/SaveModal";

export const Dropdown = styled.li`
   {
    display: inline-block;
  }
`;

export const DropdownContent = styled.div`
   {
    display: flex;
    flex-direction: column;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 15;
  }
`;

export const ShellOptions: React.FC<{
  changeManifest: (url: string) => void;
  saveManifest: () => void;
  setView: (view: "thumbnails" | "tree") => void;
  savePermalink: () => void;
  previouslySaved: boolean;
}> = ({
  changeManifest,
  saveManifest,
  setView,
  savePermalink,
  previouslySaved
}) => {
  const [addModalVisible, setaddModalVisible] = useState(false);
  const [saveModalVisible, setSaveModalVisible] = useState(false);

  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const manifest = useManifest();

  useEffect(() => {
    setaddModalVisible(false);
  }, [manifest]);

  return (
    <>
      {addModalVisible ? (
        <AddManifestModal
          manifest={manifest ? manifest?.id : ""}
          onChange={(url: string) => changeManifest(url)}
          close={() => setaddModalVisible(false)}
        />
      ) : (
        <></>
      )}
      {saveModalVisible ? (
        <SaveModal
          close={() => setSaveModalVisible(false)}
          savePermalink={savePermalink}
          previouslySaved={previouslySaved}
        />
      ) : (
        <></>
      )}
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
                alert("Export clicked");
              }}
            >
              Export
            </Button>
          </DropdownContent>
        )}
      </Dropdown>
      <Dropdown onMouseLeave={() => setViewOpen(false)}>
        <Button onClick={() => setViewOpen(!viewOpen)}>View</Button>
        {viewOpen && (
          <DropdownContent>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                setView("tree");
              }}
            >
              IIIF Tree Structure
            </Button>
            <Button
              onClick={() => {
                setViewOpen(!viewOpen);
                setView("thumbnails");
              }}
            >
              Canvas Thumbnails
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
    </>
  );
};
