import { useState, useRef } from "react";
import { Button, CalltoButton, SecondaryButton } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { ModalHeader } from "../atoms/ModalHeader";
import { HorizontalDivider } from "../atoms/HorizontalDivider";
import { TabPanel } from "../atoms/TabPanel";
import { WarningMessage } from "../atoms/callouts/WarningMessage";
import { useManifest } from "../../hooks/useManifest";
import { JSONPreview } from "../atoms/JSONPreview";
import { useVault } from "react-iiif-vault";

export const ExportModal: React.FC<{
  close: any;
}> = ({ close }) => {
  const [selected, setSelected] = useState(0);

  const [copySuccess, setCopySuccess] = useState("");
  const textAreaRef = useRef(null);
  const manifest = useManifest();

  function copyToClipboard() {
    if (textAreaRef && textAreaRef.current) {
      navigator.clipboard.writeText(JSON.stringify(manifest));
      setCopySuccess("Copied!");
    }
  }

  const vault = useVault();
  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>Export Manifest</ModalHeader>
          <Button onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        <HorizontalDivider />
        <br />
        <FlexContainerColumn justify={"flex-start"}>
          {selected === 1 && (
            <WarningMessage>
              Not all features of IIIF are available in Version 2
            </WarningMessage>
          )}
          {manifest && (
            <TabPanel
              menu={[
                {
                  label: "IIIF Presentation 3",
                  component: (
                    <JSONPreview>
                      <pre
                        dangerouslySetInnerHTML={{
                          __html: JSON.stringify(manifest, null, 2),
                        }}
                      />
                    </JSONPreview>
                  ),
                },
                {
                  label: "IIIF Presentation 2",
                  component: (
                    <JSONPreview>
                      <pre
                        dangerouslySetInnerHTML={{
                          __html: JSON.stringify(
                            vault.toPresentation2(manifest),
                            null,
                            2
                          ),
                        }}
                      />
                    </JSONPreview>
                  ),
                },
              ]}
              switchPanel={(idx: number) => setSelected(idx)}
              selected={selected}
            />
          )}
        </FlexContainerColumn>

        <FlexContainer style={{ justifyContent: "flex-end" }}>
          <SecondaryButton onClick={() => close()}>CANCEL</SecondaryButton>
          <CalltoButton
            onClick={() => {
              savePermalink();
              setSaveClicked(true);
            }}
          >
            SAVE
          </CalltoButton>
        </FlexContainer>
      </ModalContainer>
    </>
  );
};
