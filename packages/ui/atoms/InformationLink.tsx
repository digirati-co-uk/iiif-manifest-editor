import { InfoIcon } from "../icons/InfoIcon";
import { Button } from "./Button";

export const InformationLink: React.FC<{ guidanceReference: string }> = ({ guidanceReference }) => {
  return (
    <Button style={{ background: "transparent" }}>
      <a aria-label="IIIF DOCUMENTATION" href={guidanceReference} target={"_blank"} rel="noopener noreferrer">
        <InfoIcon />
      </a>
    </Button>
  );
};
