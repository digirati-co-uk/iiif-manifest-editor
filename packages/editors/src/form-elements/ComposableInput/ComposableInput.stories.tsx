import { ComposableInput } from "./ComposableInput";
import { InputContainer, InputLabel } from "../../components/Input";
import { PaddedSidebarContainer } from "@manifest-editor/components";

export default { title: "Composable Input", panel: "right" };

export const NormalInput = () => {
  return (
    <PaddedSidebarContainer>
      <InputContainer $fluid>
        <InputLabel>Text input</InputLabel>
        <ComposableInput.Container>
          <ComposableInput.Text />
        </ComposableInput.Container>
      </InputContainer>
    </PaddedSidebarContainer>
  );
};

export const Number = () => {
  return (
    <PaddedSidebarContainer>
      <InputContainer $fluid>
        <InputLabel>Number input</InputLabel>
        <ComposableInput.Container>
          <ComposableInput.Number />
        </ComposableInput.Container>
      </InputContainer>
    </PaddedSidebarContainer>
  );
};

export const Invisible = () => {
  return (
    <PaddedSidebarContainer>
      <InputContainer $fluid>
        <InputLabel>Read only input</InputLabel>
        <ComposableInput.Container>
          <ComposableInput.ReadOnly>Some text you cannot change</ComposableInput.ReadOnly>
        </ComposableInput.Container>
      </InputContainer>
    </PaddedSidebarContainer>
  );
};
