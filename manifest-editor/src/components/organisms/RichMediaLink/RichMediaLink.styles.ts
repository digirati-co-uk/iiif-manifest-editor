import styled, { css } from "styled-components";

const Container = styled.div<{ $interactive?: boolean }>`
  padding: 0.5em;
  background: #ffffff;
  border: 1px solid #c7c7c7;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.07);
  border-radius: 3px;
  display: flex;
  margin-bottom: 0.5em;

  ${(props) =>
    props.$interactive &&
    css`
      cursor: pointer;
      &:hover {
        border-color: cornflowerblue;
        outline: 1px solid cornflowerblue;
      }
    `}
`;

const Icon = styled.div`
  background: red;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;
`;

const Title = styled.div`
  color: #494949;
  flex: 1;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 0.875em;
`;

const Link = styled.a`
  color: #7472e9;
  font-size: 0.8em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
`;

const Label = styled.div`
  color: #9a9a9a;
  font-size: 0.8em;
  margin-left: auto;
`;

export const RichMediaLinkStyles = {
  Container,
  Icon,
  Title,
  Link,
  Label,
  Content,
  TitleContainer,
};
