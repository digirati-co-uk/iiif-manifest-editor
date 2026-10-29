import { useTranslations } from "@manifest-editor/i18n";
import { AddIcon } from "../icons/AddIcon";
import { FlexContainer } from "../components/layout/FlexContainer";
import { Button } from "./Button";
import { InformationLink } from "./InformationLink";
import styled from "styled-components";

const EmptyPropertyContainer = styled(FlexContainer)`
  justify-content: space-between;
`;

type NewProperty = {
  label: string;
  createNew?: () => void;
  guidanceReference?: string;
};

export const EmptyProperty: React.FC<NewProperty> = ({ label, createNew, guidanceReference }) => {
  const t = useTranslations("ui");
  return (
    <EmptyPropertyContainer>
      <FlexContainer style={{ alignItems: "center" }}>
        <h4>{label}</h4>
        {guidanceReference && <InformationLink guidanceReference={guidanceReference} />}
      </FlexContainer>
      {createNew && (
        <Button aria-label={t("property.add", { label })} title={t("property.add", { label })} onClick={createNew}>
          <AddIcon />
        </Button>
      )}
    </EmptyPropertyContainer>
  );
};
