import { useContext } from "react";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer } from "../layout/FlexContainer";
import { ModalHeader } from "../atoms/ModalHeader";

import ShellContext from "../apps/Shell/ShellContext";

import { NewTemplates } from "../widgets/NewTemplates";

export const NewManifestModal: React.FC<{
  close: any;
}> = ({ close }) => {
  const shellContext = useContext(ShellContext);

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>New Manifest</ModalHeader>
          <Button onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        <NewTemplates
          changeManifest={(id: string) => {
            shellContext?.changeSelectedApplication("ManifestEditor");
            shellContext?.changeResourceID(id);
            close();
          }}
          newTemplates={shellContext?.newTemplates}
        />
      </ModalContainer>
    </>
  );
};
