import { DimensionsForm } from "./DimensionsForm";
import { SingleValueInput } from "./SingleValueInput";
import { Input, InputContainer, InputLabel } from "../Input";
import { useCanvas } from "react-iiif-vault";

export const TechnicalForm = () => {
  const canvas = useCanvas();
  return (
    <>
      <InputContainer wide>
        <InputLabel>Identifier</InputLabel>
        <Input disabled value={canvas?.id} />
      </InputContainer>
      <SingleValueInput dispatchType={"behavior"} />
      <DimensionsForm />
    </>
  );
};
