import { Input } from "../form/Input";
import { Button, SecondaryButton, CalltoButton } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { useRef, useState } from "react";

import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainerColumn, FlexContainerRow } from "../layout/FlexContainer";
import { CopyIcon } from "../icons/Copy";
import styled from "styled-components";

const LinkBox = styled.div`
  color: #347cff;
  width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: none;
  resize: none;
`;

const HiddenElement = styled.textarea`
  display: none;
`;

export const PersistenceModal: React.FC<{
  manifest: string;
  onChange: any;
  close: any;
  value: boolean;
  link: string;
}> = ({ manifest, onChange, close, value, link }) => {
  const [copySuccess, setCopySuccess] = useState("");
  const textAreaRef = useRef(null);

  function copyToClipboard(e: any) {
    if (textAreaRef && textAreaRef.current) {
      // @ts-ignore
      textAreaRef?.current?.select();
      document.execCommand("copy");
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
            <h3>Preview IIIF Manifest</h3>
            <Button onClick={close}>
              <CloseIcon />
            </Button>
          </FlexContainerRow>
          <p>A preview of this Manifest is now available at: </p>

          <FlexContainerRow
            justify={"space-between"}
            style={{ justifyItems: "center" }}
          >
            <LinkBox ref={textAreaRef}>
              <a href={link} target={"_blank"} rel="noreferrer" onClick={close}>
                {manifest}
              </a>
            </LinkBox>
            <HiddenElement ref={textAreaRef} defaultValue={manifest} />
            {document.queryCommandSupported("copy") && (
              <>
                <SecondaryButton onClick={(e: any) => copyToClipboard(e)}>
                  <CopyIcon /> Copy Link
                </SecondaryButton>
                {copySuccess}
              </>
            )}
          </FlexContainerRow>
          <p>
            <small>
              This preview will expire in 48 hours. For a permanent version,
              select Permalink from the File / Save As menu option.
            </small>
          </p>
          <label>
            <Input
              type={"checkbox"}
              checked={value}
              onChange={(e: any) => onChange(e.target.value)}
            />
            <span>Don't show this again</span>
          </label>
          <FlexContainerRow justify={"flex-end"}>
            <CalltoButton>
              <a href={link} target={"_blank"} rel="noreferrer" onClick={close}>
                PREVIEW
              </a>
            </CalltoButton>
          </FlexContainerRow>
        </FlexContainerColumn>
      </ModalContainer>
    </>
  );
};
