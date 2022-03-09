import React from "react";
import styled, { css } from "styled-components";

const PanelHeader = styled.div<{ $active?: boolean }>`
  max-width: 200px;
  overflow: hidden;
  font-size: 14px;
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
  color: ${(props: any) => props.theme.color.black || "black"};
  ${(props) =>
    props.$active &&
    css`
      color: ${props.theme.color.black || "black"};
      border-bottom: 2px solid ${props.theme.color.main || "blue"};
    `};
`;

const TabPanelOptions = styled.div`
  display: flex;
  background-color: ${(props: any) => props.theme.color.white || "white"};
  border: 0.05px solid ${(props: any) => props.theme.color.lightgrey || "lightgrey"};
`;

const TabPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${(props: any) => props.theme.color.lightgrey || "lightgrey"};
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
            <PanelHeader
              key={idx}
              $active={idx === selected}
              onClick={() => switchPanel(idx)}
            >
              {item.label}
            </PanelHeader>
          );
        })}
      </TabPanelOptions>
      {menu[selected].component}
    </TabPanelContainer>
  );
};
