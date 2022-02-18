import { useState, useEffect } from "react";
import styled from "styled-components";
import { AddManifestModal } from "../../molecules/AddManifestModal";
import { Button } from "../../atoms/Button";
import { useManifest } from "../../../hooks/useManifest";

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
    z-index: 1;
  }
`;

export const ShellOptions: React.FC<{
  changeManifest: (url: string) => void;
  saveManifest: () => void;
  setView: (view: "thumbnails" | "tree") => void;
}> = ({ changeManifest, saveManifest, setView }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fileOpen, setFileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const manifest = useManifest();

  useEffect(() => {
    setModalVisible(false);
  }, [manifest]);

  return (
    <>
      {modalVisible ? (
        <AddManifestModal
          manifest={manifest ? manifest?.id : ""}
          onChange={(url: string) => changeManifest(url)}
          close={() => setModalVisible(false)}
        />
      ) : (
        <></>
      )}
      <Dropdown>
        <Button onClick={() => setFileOpen(!fileOpen)}>File</Button>
        {fileOpen && (
          <DropdownContent onMouseLeave={() => setFileOpen(false)}>
            <Button
              onClick={() => setModalVisible(!modalVisible)}
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
                alert("Save as clicked");
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
