import { Tree } from "../../navigation/tree/Tree";

import styled from "styled-components";
import { ViewSelector } from "../../atoms/ViewSelector";
import { GridList } from "../organisms/GridView/GridList";
import { FlexContainerColumn } from "./FlexContainer";

const ContentSelectorContainer = styled.div`
   {
    display: flex;
    flex-direction: column;
    border-right: 0.016rem solid #dddddd;
    justify-content: space-between;
    align-items: center;
    margin: 0.375rem;
    overflow-y: scroll;
    padding: ${(props: any) => props.theme.padding.small || "0.5rem"} 0;
    height: 75vh;
    @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
      width: 100%;
      border-right: none;
      max-height: 30%;
    }
  }
`;

export const ThumbnailStripView: React.FC<{
  view: "tree" | "thumbnails" | "grid" | "noNav" | "fullEditor";
}> = ({ view }) => {
  return (
    <>
      {(view === "thumbnails" || view === "tree") && (
        <FlexContainerColumn style={{ alignItems: "center" }}>
          <ContentSelectorContainer>
            {view === "thumbnails" && <GridList />}
            {view === "tree" && <Tree />}
          </ContentSelectorContainer>
          <ViewSelector />
        </FlexContainerColumn>
      )}
    </>
  );
};
