import styled from "styled-components";

export const RecentFilesWidget = styled.div`
  height: 16rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: ${(props: any) => props.theme.shadows.standard || ""};
  padding: ${(props: any) => props.theme.padding.small || "0.25rem"};
  background: ${(props: any) => props.theme.color.white || "white"};
  // border: 1px solid black;
  // border-radius: 1rem;
`;

export const RecentThumbnails = styled.div`
  width: 100%
  overflow: auto;
  justify-content: flex-start;
  display: flex;
`;

export const RecentManifestCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${(props: any) => props.theme.padding.xs || "0.25rem"};
  word-break: break-all;
  overflow-y: clip;
  max-width: 8rem;
`;

export const RecentLabel = styled.small`
  text-align: center;
`;
