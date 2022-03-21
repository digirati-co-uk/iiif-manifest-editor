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
        <a href={guidanceReference} target={"_blank"} rel="noopener noreferrer">
          <InfoIcon />
        </a>
      </FlexContainer>
    </>
  );
};
