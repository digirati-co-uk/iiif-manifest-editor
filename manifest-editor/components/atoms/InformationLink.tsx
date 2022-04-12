import { InfoIcon } from "../icons/InfoIcon";
import { FlexContainer } from "../layout/FlexContainer";
import { HorizontalDivider } from "./HorizontalDivider";

export const InformationLink: React.FC<{ guidanceReference: string }> = ({
  guidanceReference,
}) => {
  return (
    <>
      <HorizontalDivider />
      <FlexContainer style={{ justifyContent: "flex-end" }}>
        <a
          aria-label="IIIF DOCUMENTATION"
          href={guidanceReference}
          target={"_blank"}
          rel="noopener noreferrer"
        >
          <InfoIcon />
        </a>
      </FlexContainer>
    </>
  );
};
