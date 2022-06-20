import { SingleValueInput } from "./SingleValueInput";
import { Input, InputContainer, InputLabel } from "../Input";
import { useManifest } from "../../hooks/useManifest";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { PaddingComponentMedium } from "../../atoms/PaddingComponent";

export const TechnicalForm = () => {
  const manifest = useManifest();
  return (
    <>
      <InputContainer wide>
        <InputLabel>Identifier</InputLabel>
        <FlexContainer>
          <Input disabled value={manifest?.id} />
          <PaddingComponentMedium />
        </FlexContainer>
      </InputContainer>
      <SingleValueInput dispatchType={"viewingDirection"} />
      <SingleValueInput dispatchType={"behavior"} />
    </>
  );
};
