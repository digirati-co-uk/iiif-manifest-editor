import { InfoIcon } from "../icons/InfoIcon";
import { FlexContainer } from "../components/layout/FlexContainer";
import { Button } from "./Button";
import { HorizontalDivider } from "./HorizontalDivider";

export const InformationLink: React.FC<{ guidanceReference: string }> = ({ guidanceReference }) => {
  return (
    <Button>
      <a aria-label="IIIF DOCUMENTATION" href={guidanceReference} target={"_blank"} rel="noopener noreferrer">
        <InfoIcon />
      </a>
    </Button>
  );
};
