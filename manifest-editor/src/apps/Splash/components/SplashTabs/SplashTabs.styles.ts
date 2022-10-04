import styled, { css } from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Menu = styled.div`
  background: #fff;
  padding: 1.5em;
  display: flex;
  white-space: nowrap;
  overflow-y: auto;
  border: 1px solid #e1e1e1;
  border-left-width: 0;
  border-right-width: 0;
`;

const InnerContainer = styled.div`
  max-width: 80em;
  display: flex;
  flex: 1;
  margin: 0 auto;
`;

const MenuItem = styled.button<{ $active?: boolean }>`
  padding: 0.8em 1.3em;
  background: transparent;
  border: none;
  margin-left: 1em;
  border-radius: 1.4em;
  height: 2.8em;
  align-items: center;
  color: #4e4e4e;
  font-size: inherit;
  display: flex;
  &:hover {
    background: #ebeef5;
  }

  ${(props) =>
    props.$active &&
    css`
      background: #e2e7f0;
      &:hover {
        background: #e2e7f0;
      }
    `}
`;

const Content = styled.div`
  background: #e2e7f0;
  flex: 1;
`;

const InnerContent = styled.div`
  max-width: 80em;
  min-height: 10em;
  margin: 0 auto;
`;

export const SplashTabsStyles = {
  Container,
  Menu,
  MenuItem,
  Content,
  InnerContent,
  InnerContainer,
};
