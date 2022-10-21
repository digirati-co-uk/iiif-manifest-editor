import styled, { css } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  flex: 1;
  min-width: 0;
  max-width: 44em;
  padding: 1em;
  margin: 0 auto;

  @media (max-width: 500px) {
    margin-top: 2em;
  }
`;

const LogoContainer = styled.div`
  margin: 5em 0;
  max-width: 500px;
  width: 100%;

  @media (max-width: 500px) {
    display: none;
  }
`;

const InputContainer = styled.div`
  background: red;
  font-size: 1.6em;
  width: 100%;
  margin: 0 1em;
  margin-bottom: 0.6em;
`;

const LearnMore = styled.button`
  align-self: center;
  display: flex;
  align-items: center;
  background: none;
  font-size: inherit;
  color: #6b73ff;
  border: none;
  padding: 0.4em 1em;
  margin: auto;

  &:hover {
    background: #f9f9f9;
  }

  svg {
    margin-left: 0.5em;
  }
`;

const OpenManifest = styled.div`
  background: transparent;
  align-self: flex-end;
  display: flex;
  border: none;
  align-items: center;
  margin-top: 0.5em;

  svg {
    margin-left: 0.5em;
  }
`;

const LoadingBox = styled.div<{ $loading?: boolean }>`
  padding: 1.4em;
  width: 100%;
  background: #ebfff2;
  ${(props) =>
    props.$loading &&
    css`
      background: #fcffeb;
    `}

  display: flex;

  svg {
    margin-right: 0.5em;
    align-items: center;
  }

  svg path {
    fill: #000;
    stroke: #000;
  }
  svg circle {
    stroke: #000;
  }
`;

const ErrorBox = styled.div`
  padding: 1.4em;
  width: 100%;
  background: #ffd4d7;
`;

const LoadingContainer = styled.div`
  height: 8em;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

export const ManifestOpenerStyles = {
  Container,
  LogoContainer,
  InputContainer,
  LearnMore,
  ErrorBox,
  LoadingContainer,
  OpenManifest,
  LoadingBox,
};
