import React from "react";
import styled, { css } from "styled-components";

const PanelHeader = styled.div<{ $active?: boolean }>`
  overflow: hidden;
  font-size: 14px;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  background: ${(props: any) => props.theme.color.white || "white"};
  color: ${(props: any) => props.theme.color.main || "blue"};
  cursor: pointer;
  border-bottom: 2px solid ${(props: any) => props.theme.color.mediumgrey || "grey"};
  overflow: hidden;
  text-overflow: ellipsis;
  ${(props) =>
    props.$active &&
    css`
      color: ${props.theme.color.black || "black"};
      border-bottom: 2px solid #ff9999;
      border-radius: 0.25rem 0.25rem 0 0;
    `};
`;

const TabPanelOptions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  background-color: ${(props: any) => props.theme.color.white || "white"};
  box-shadow: inset 0 -2px 0 0 ${(props: any) => props.theme.color.mediumgrey || "grey"};
`;

const TabPanelContainer = styled.div<{ $width?: any }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    width: 100vw;
    border-top: 1px solid rgba(5, 42, 68, 0.2);
    border-left: none;
  }
`;

const Content = styled.div`
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  max-height: 60vh;
  overflow: auto;
`;

export const TabPanel: React.FC<{
  menu: any;
  switchPanel: (idx: number) => void;
  selected: number;
  style?: any;
}> = ({ menu, switchPanel, selected, style }) => {
  return (
    <TabPanelContainer style={style}>
      <TabPanelOptions>
        {menu.map((item: any, idx: number) => {
          return (
            <PanelHeader tabIndex={-1} key={idx} $active={idx === selected} onClick={() => switchPanel(idx)}>
              {item.label}
            </PanelHeader>
          );
        })}
      </TabPanelOptions>
      <Content>{menu && menu[selected] ? menu[selected].component : menu[0].component}</Content>
    </TabPanelContainer>
  );
};
