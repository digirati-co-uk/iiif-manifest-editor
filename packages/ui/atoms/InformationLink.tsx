import { InfoIcon } from "../icons/InfoIcon";
import { Button } from "./Button";

export const InformationLink: React.FC<{ guidanceReference: string }> = ({ guidanceReference }) => {
  return (
    <Button as="a" aria-label="IIIF documentation" href={guidanceReference} target="_blank" rel="noopener noreferrer" style={{ background: "transparent" }}>
      <InfoIcon aria-hidden="true" />
    </Button>
  );
};
