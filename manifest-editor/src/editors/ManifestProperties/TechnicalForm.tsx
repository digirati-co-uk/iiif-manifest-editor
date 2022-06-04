import { SingleValueInput } from "./SingleValueInput";
import { Input, InputContainer, InputLabel } from "../Input";
import { useManifest } from "../../hooks/useManifest";

export const TechnicalForm = () => {
  const manifest = useManifest();
  return (
    <>
      <InputContainer wide>
        <InputLabel>Identifier</InputLabel>
        <Input disabled value={manifest?.id} />
      </InputContainer>
      <SingleValueInput dispatchType={"viewingDirection"} />
      <SingleValueInput dispatchType={"behavior"} />
    </>
  );
};
