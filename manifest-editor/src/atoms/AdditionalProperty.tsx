import { AddIcon } from "../icons/AddIcon";
import { FlexContainer } from "../components/layout/FlexContainer";
import { Button } from "./Button";

type AdditionalProperty = {
  label: string;
  addAnother: () => void;
};

export const AdditionalProperty: React.FC<AdditionalProperty> = ({ label, addAnother }) => {
  return (
    <FlexContainer style={{ justifyContent: "space-between" }}>
      {label}
      <Button aria-label={`Add ${label}`} title={`Add ${label}`} onClick={addAnother}>
        <AddIcon />
      </Button>
    </FlexContainer>
  );
};
