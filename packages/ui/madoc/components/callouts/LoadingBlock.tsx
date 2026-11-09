import { useTranslations } from "@manifest-editor/i18n";
import React from "react";
import styled from "styled-components";
import { Spinner } from "../icons/Spinner";

const LoadingBlockContainer = styled.div`
  text-align: center;
  padding: 10em 0;
`;

const LoadingSpinner = styled(Spinner)`
  stroke: #000;
  font-size: 2em;
  display: block;
  margin: 1em auto;
`;

export const LoadingBlock: React.FC = () => {
  const t = useTranslations("ui");
  return (
    <LoadingBlockContainer>
      <LoadingSpinner />
      {t("loading.title")}
    </LoadingBlockContainer>
  );
};
