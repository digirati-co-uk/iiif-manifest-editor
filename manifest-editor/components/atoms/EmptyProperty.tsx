import { AddIcon } from "../icons/AddIcon";
import { FlexContainer } from "../layout/FlexContainer";
import { Button } from "./Button";
import styled from "styled-components";

const EmptyPropertyContainer = styled(FlexContainer)`
  justify-content: space-between;
`;

type NewProperty = {
  label: string;
  createNew: () => void;
};

export const EmptyProperty: React.FC<NewProperty> = ({ label, createNew }) => {
  return (
    <EmptyPropertyContainer>
      <h4>{label} </h4>
      <Button
        aria-label={`Add ${label}`}
        title={`Add ${label}`}
        onClick={createNew}
      >
        <AddIcon />
      </Button>
    </EmptyPropertyContainer>
  );
};
