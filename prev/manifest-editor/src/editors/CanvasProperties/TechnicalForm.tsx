import { DimensionsForm } from "./DimensionsForm";
import { SingleValueInput } from "./SingleValueInput";
import { Input, InputContainer, InputLabel } from "../Input";
import { useCanvas } from "react-iiif-vault";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { BehaviorEditorCanvas } from "@/_components/editors/BehaviorEditor/BehaviorEditor.canvas";

export const TechnicalForm = () => {
  const canvas = useCanvas();
  return (
    <>
      <PaddedSidebarContainer>
        <InputContainer wide>
          <InputLabel>Identifier</InputLabel>
          <Input disabled value={canvas?.id} />
        </InputContainer>
        <DimensionsForm />
      </PaddedSidebarContainer>
      <BehaviorEditorCanvas />
    </>
  );
};
