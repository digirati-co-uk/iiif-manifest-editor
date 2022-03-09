import { ThumbnailStrip } from "../organisms/ThumbnailStrip";
import { Tree } from "../tree/Tree";

import styled from "styled-components";

const ContentSelectorContainer = styled.div`
   {
    display: flex;
    flex-direction: row;
    border-right: 0.016rem solid #dddddd;
    justify-content: flex-start;
    margin: 0.375rem 0;
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"} 0;
    height: 80vh;
    overflow-y: auto;
  }
`;

export const ContentSelector: React.FC<{
  view: "tree" | "thumbnails";
}> = ({ view }) => {
  return (
    <ContentSelectorContainer>
      {view === "thumbnails" && <ThumbnailStrip />}
      {view === "tree" && <Tree />}
    </ContentSelectorContainer>
  );
};
