import { AddIcon } from "../icons/AddIcon";
import { FlexContainer } from "../layout/FlexContainer";
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

export const EmptyProperty: React.FC<NewProperty> = ({
  label,
  createNew,
  guidanceReference,
}) => {
  return (
    <EmptyPropertyContainer>
      <FlexContainer style={{ alignItems: "center" }}>
        <h4>{label}</h4>
        {guidanceReference && (
          <InformationLink guidanceReference={guidanceReference} />
        )}
      </FlexContainer>
      {createNew && (
        <Button
          aria-label={`Add ${label}`}
          title={`Add ${label}`}
          onClick={createNew}
        >
          <AddIcon />
        </Button>
      )}
    </EmptyPropertyContainer>
  );
};
