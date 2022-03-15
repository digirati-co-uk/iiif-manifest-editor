import { ThumbnailStrip } from "../organisms/ThumbnailStrip";
import { Tree } from "../tree/Tree";

import styled from "styled-components";
import { ViewSelector } from "../atoms/ViewSelector";

const ContentSelectorContainer = styled.div`
   {
    display: flex;
    flex-direction: column;
    border-right: 0.016rem solid #dddddd;
    justify-content: space-between;
    align-items: center;
    margin: 0.375rem 0;
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"} 0;
    height: 80vh;
    @media (max-width: ${(props: any) =>
        props.theme.device.tablet || "770px"}) {
      width: 100%;
      border-right: none;
      max-height: 30%;
    }
  }
`;

export const ContentSelector: React.FC<{
  view: "tree" | "thumbnails" | "grid" | "noNav" | "fullEditor";
}> = ({ view }) => {
  return (
    <>
      {(view === "thumbnails" || view === "tree") && (
        <ContentSelectorContainer>
          {view === "thumbnails" && <ThumbnailStrip />}
          {view === "tree" && <Tree />}
          <ViewSelector />
        </ContentSelectorContainer>
      )}
    </>
  );
};
