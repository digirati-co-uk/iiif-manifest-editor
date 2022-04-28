import { useRef, useState } from "react";

import { CopyIcon } from "../icons/CopyIcon";
import styled from "styled-components";
import { FlexContainerRow } from "../layout/FlexContainer";
import { SecondaryButton } from "./Button";

const LinkBox = styled.div`
  color: ${(props: any) => props.theme.color.main || "none"};
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

export const CopyURL: React.FC<{ manifest: string; link: string }> = ({
  manifest,
  link,
}) => {
  const [copySuccess, setCopySuccess] = useState("");
  const textAreaRef = useRef(null);

  function copyToClipboard() {
    if (textAreaRef && textAreaRef.current) {
      navigator.clipboard.writeText(manifest);
      setCopySuccess("Copied!");
    }
  }
  return (
    <FlexContainerRow
      justify={"space-between"}
      style={{ alignItems: "center" }}
    >
      <LinkBox ref={textAreaRef}>
        <a href={link} target={"_blank"} rel="noreferrer" onClick={close}>
          {manifest}
        </a>
      </LinkBox>
      <HiddenElement ref={textAreaRef} defaultValue={manifest} />
      <SecondaryButton onClick={() => copyToClipboard()} aria-label="copy url">
        <CopyIcon />
        Copy Link
      </SecondaryButton>
      <small>{copySuccess}</small>
    </FlexContainerRow>
  );
};
