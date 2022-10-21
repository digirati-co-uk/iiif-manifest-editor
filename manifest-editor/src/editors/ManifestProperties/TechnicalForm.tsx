import { SingleValueInput } from "./SingleValueInput";
import { Input, InputContainer, InputLabel } from "../Input";
import { useManifest } from "../../hooks/useManifest";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { PaddingComponentMedium } from "../../atoms/PaddingComponent";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { ViewingDirectionEditorManifest } from "@/_components/editors/ViewingDirectionEditor/ViewingDirectionEditor.manifest";
import { BehaviorEditorManifest } from "@/_components/editors/BehaviorEditor/BehaviorEditor.manifest";

export const TechnicalForm = () => {
  const manifest = useManifest();
  return (
    <>
      <PaddedSidebarContainer>
        <InputContainer wide>
          <InputLabel>Identifier</InputLabel>
          <FlexContainer>
            <Input disabled value={manifest?.id} />
            <PaddingComponentMedium />
          </FlexContainer>
        </InputContainer>

        <ViewingDirectionEditorManifest />
      </PaddedSidebarContainer>

      <BehaviorEditorManifest />
    </>
  );
};
