import { useContext } from "react";
import ManifestEditorContext from "../apps/ManifestEditor/ManifestEditorContext";
import { DownIcon } from "../icons/DownIcon";
import { SmallButton } from "./Button";

import styled from "styled-components";

const ExpandTabContainer = styled.div`
  border-radius: 0 1rem 1rem 0;
  border-top: 0.016rem solid
    ${(props: any) => props.theme.color.mediumgrey || "grey"};
  border-right: 0.016rem solid
    ${(props: any) => props.theme.color.mediumgrey || "grey"};
  border-bottom: 0.016rem solid
    ${(props: any) => props.theme.color.mediumgrey || "grey"};
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"} 0;
  height: 3rem;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    border: none;
    display: flex;
    button {
      transform: rotate(90deg);
    }
    justify-content: flex-end;

`;

export const ExpandTab: React.FC = () => {
  const editorContext = useContext(ManifestEditorContext);
  return (
    <ExpandTabContainer>
      {editorContext?.view === "noNav" ? (
        <SmallButton
          aria-label="expand"
          onClick={() => editorContext?.setView("tree")}
          title="Navigation panel"
        >
          <DownIcon rotate={270} />
        </SmallButton>
      ) : (
        <SmallButton
          aria-label="close"
          onClick={() => editorContext?.setView("noNav")}
          title="Close navigation panel"
        >
          <DownIcon rotate={90} />
        </SmallButton>
      )}
    </ExpandTabContainer>
  );
};
