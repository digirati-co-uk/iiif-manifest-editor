import { useState, useRef, useEffect } from "react";
import { CalltoButton } from "../../atoms/Button";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { TabPanel } from "../layout/TabPanel";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";
import { useManifest } from "../../hooks/useManifest";
import { JSONPreview } from "../../atoms/JSONPreview";
import { useCollection, useVault } from "react-iiif-vault";
import { PaddingComponentSmall } from "../../atoms/PaddingComponent";

export const ExportToJson: React.FC<{
  close: any;
}> = ({ close }) => {
  const [selected, setSelected] = useState(0);

  const [copySuccess, setCopySuccess] = useState("");
  const textAreaRef = useRef(null);
  const manifest = useManifest();
  const collection = useCollection({} as any);
  const resource = manifest || collection;
  const vault = useVault();

  useEffect(() => {
    setCopySuccess("");
  }, [selected]);

  function copyToClipboard() {
    const man = selected === 1 && resource ? vault.toPresentation2(resource) : resource;

    if (textAreaRef && textAreaRef.current) {
      navigator.clipboard.writeText(JSON.stringify(man));
      setCopySuccess("Copied!");
    }
  }

  const downloadFile = (data: any, fileName: string, fileType: "text/json"): void => {
    // Create a blob with the data we want to download as a file
    const blob = new Blob([data], { type: fileType });
    // Create an anchor element and dispatch a click event on it
    // to trigger a download
    const a = document.createElement("a");
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    const clickEvt = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    a.dispatchEvent(clickEvt);
    a.remove();
  };

  const exportToJson = (e: any) => {
    if (!resource) {
      return;
    }
    e.preventDefault();
    downloadFile(
      JSON.stringify(selected === 1 && resource ? vault.toPresentation2(resource) : vault.toPresentation3(resource)),
      //  defaulting to manifest id for the filename but we can change this.
      resource.id + ".json",
      "text/json"
    );
  };

  return (
    <>
      <FlexContainerColumn justify={"flex-start"}>
        {selected === 1 && <WarningMessage>Not all features of IIIF are available in Version 2</WarningMessage>}
        {resource && (
          <TabPanel
            style={{ width: "unset" }}
            menu={[
              {
                label: "IIIF Presentation 3",
                component: (
                  <JSONPreview>
                    <pre
                      ref={textAreaRef}
                      dangerouslySetInnerHTML={{
                        __html: JSON.stringify(vault.toPresentation3(resource), null, 2),
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
                      ref={textAreaRef}
                      dangerouslySetInnerHTML={{
                        __html: `<code>${JSON.stringify(vault.toPresentation2(resource), null, 2)}</code>`,
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
        <small>{copySuccess}</small>
        <PaddingComponentSmall />
        <CalltoButton
          aria-label="copy"
          onClick={() => {
            copyToClipboard();
          }}
        >
          COPY TO CLIPBOARD
        </CalltoButton>
        <PaddingComponentSmall />
        <CalltoButton
          onClick={(e: any) => {
            exportToJson(e);
          }}
          aria-label="download json"
        >
          DOWNLOAD JSON
        </CalltoButton>
      </FlexContainer>
    </>
  );
};
