import { ThumbnailStrip } from "../organisms/ThumbnailStrip";
import { Tree } from "../organisms/Tree";

import styled from "styled-components";

const ContentSelectorContainer = styled.div`
   {
    display: flex;
    flex-direction: row;
    border-right: 0.016rem solid #dddddd;
    justify-content: flex-start;
    margin: 0.375rem 0;
    padding: 0.25rem 0;
    height: 80vh;
    overflow-y: scroll;
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
