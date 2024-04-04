import React, { useLayoutEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { HandleContainer } from "@/_components/ui/ReorderListItem/ReorderListItem.styles";
import { MoreMenu } from "@/icons/MoreMenu";
import { AppDropdown } from "@/_components/ui/AppDropdown/AppDropdown";

const PanelHeader = styled.div<{ $active?: boolean }>`
  font-size: 0.875em;
  padding: ${(props: any) => props.theme.padding.small || "0.5rem"};
  background: ${(props: any) => props.theme.color.white || "white"};
  color: ${(props: any) => props.theme.color.gray || "gray"};
  cursor: pointer;
  border-bottom: 2px solid ${(props: any) => props.theme.color.mediumgrey || "grey"};
  ${(props) =>
    props.$active &&
    css`
      color: ${props.theme.color.main || "blue"};
      border-bottom: ${`2px solid ${props.theme.color.main || "blue"}`};
      border-radius: 0.25rem 0.25rem 0 0;
    `};

  &[data-hidden="true"] {
    display: none;
  }
`;

const TabPanelOptions = styled.div`
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
  background-color: ${(props: any) => props.theme.color.white || "white"};
  box-shadow: inset 0 -2px 0 0 ${(props: any) => props.theme.color.mediumgrey || "grey"};
`;

const TabPanelContainer = styled.div<{ $width?: any }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  @media (max-width: ${(props: any) => props.theme.device.tablet || "770px"}) {
    width: 100vw;
    border-top: 1px solid rgba(5, 42, 68, 0.2);
    border-left: none;
  }
`;

const Content = styled.div`
  overflow: auto;
  flex: 1;
`;
const TabMore = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 0.2em;
  border-radius: 3px;

  &:hover {
    background: #eee;
  }

  &[data-active="true"] {
    border: 2px solid ${(props: any) => props.theme.color.main || "blue"};
    // box-shadow: inset 0 -2px 0 0 ${(props: any) => props.theme.color.main || "blue"};
  }
`;

export const TabPanel: React.FC<{
  menu: any;
  switchPanel: (idx: number) => void;
  selected: number;
  style?: any;
}> = ({ menu, switchPanel, selected, style }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const first = React.useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = React.useState(0);
  const widths = React.useRef<number[]>([]);
  const itemsRef = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    widths.current = [];
    for (const item of itemsRef.current) {
      if (item) {
        widths.current.push(item.getBoundingClientRect().width);
      }
    }
  }, []);

  useLayoutEffect(() => {
    const cb = () => {
      const fullWidth = widths.current.reduce((a, b) => a + b, 0);

      if (fullWidth && ref.current) {
        const el = ref.current;
        const width = el.getBoundingClientRect().width - 20; // 60 is the width of the "more" button

        let hidden = 0;
        let total = 0;
        for (let i = widths.current.length - 1; i >= 0; i--) {
          total += widths.current[i];
          if (total > width) {
            hidden = i + 1;
            break;
          }
        }

        setHidden(hidden);
      }
    };
    cb();
    const interval = setInterval(cb, 1500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <TabPanelContainer style={style}>
      <TabPanelOptions ref={ref}>
        {menu.map((item: any, idx: number) => {
          return (
            <PanelHeader
              ref={(el) => (itemsRef.current[idx] = el)}
              tabIndex={-1}
              key={idx}
              $active={idx === selected}
              onClick={() => switchPanel(idx)}
              data-hidden={hidden >= menu.length - idx}
            >
              {item.label}
            </PanelHeader>
          );
        })}
        {hidden ? (
          <AppDropdown
            as={TabMore}
            style={{ marginLeft: "auto", height: "1.5em", width: "1.5em", alignSelf: "center", marginRight: "0.2em" }}
            data-active={menu.length - hidden <= selected}
            items={[
              ...menu.slice(menu.length - hidden).map((item: any, idx: number) => ({
                label: item.label,
                onClick: () => switchPanel(menu.length - hidden + idx),
                active: menu.length - hidden + idx === selected,
              })),
            ]}
          >
            <MoreMenu />
          </AppDropdown>
        ) : null}
      </TabPanelOptions>

      <Content>
        {menu && menu[selected]
          ? menu[selected].renderComponent
            ? menu[selected].renderComponent()
            : menu[selected].component
          : menu[0].component || menu[0].renderComponent()}
      </Content>
    </TabPanelContainer>
  );
};
