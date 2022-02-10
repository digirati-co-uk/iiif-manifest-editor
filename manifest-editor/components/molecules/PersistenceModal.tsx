import { Input } from "../form/Input";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { useRef, useState } from "react";

import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainerColumn, FlexContainerRow } from "../layout/FlexContainer";

export const PersistenceModal: React.FC<{
  manifest: string;
  onChange: any;
  close: any;
  value: boolean;
}> = ({ manifest, onChange, close, value }) => {
  const [copySuccess, setCopySuccess] = useState("");
  const textAreaRef = useRef();

  function copyToClipboard(e: HTMLElementEventMap) {
    if (textAreaRef) {
      textAreaRef?.current?.select();
      document.execCommand("copy");
      // This is just personal preference.
      // I prefer to not show the whole text area selected.
      e?.target?.focus();
      setCopySuccess("Copied!");
    }
  }

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainerColumn justify={"flex-start"}>
          <FlexContainerRow justify={"space-between"}>
            <h4>Preview IIIF Manifest</h4>
            <Button onClick={close}>
              <CloseIcon />
            </Button>
          </FlexContainerRow>
          <p>A preview of this Manifest is now available at: </p>

          <FlexContainerRow justify={"space-between"}>
            <form>
              <textarea ref={textAreaRef} value={manifest} />
            </form>
            {document.queryCommandSupported("copy") && (
              <div>
                <button onClick={copyToClipboard}>Copy</button>
                {copySuccess}
              </div>
            )}
          </FlexContainerRow>

          <Input
            type={"checkbox"}
            checked={value}
            onChange={(e: any) => setInputValue(e.target.value)}
          />

          <Button onClick={() => onChange(inputValue)}>Load Manifest</Button>
        </FlexContainerColumn>
      </ModalContainer>
    </>
  );
};

export default function CopyExample() {
  const [copySuccess, setCopySuccess] = useState("");
  const textAreaRef = useRef(null);

  function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand("copy");
    // This is just personal preference.
    // I prefer to not show the whole text area selected.
    e.target.focus();
    setCopySuccess("Copied!");
  }

  return (
    <div>
      {/* Logical shortcut for only displaying the
          button if the copy command exists */
      document.queryCommandSupported("copy") && (
        <div>
          <button onClick={copyToClipboard}>Copy</button>
          {copySuccess}
        </div>
      )}
      <form>
        <textarea ref={textAreaRef} value="Some text to copy" />
      </form>
    </div>
  );
}
