import styled from "styled-components";

export const RecentFilesWidget = styled.div`
  min-height: 10rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: ${(props: any) => props.theme.shadows.standard || ""};
  padding: ${(props: any) => props.theme.padding.medium || "2rem"};
  background: ${(props: any) => props.theme.color.white || "white"};
`;

export const RecentThumbnails = styled.div`
  width: 100%;
  overflow: auto;
  justify-content: flex-start;
  display: flex;
`;

export const RecentManifestCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: ${(props: any) => props.theme.padding.xs || "0.25rem"};
`;

export const RecentLabel = styled.small`
  text-align: center;
`;
