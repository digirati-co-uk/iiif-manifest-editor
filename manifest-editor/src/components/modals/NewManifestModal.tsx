import { useContext } from "react";
import { Button } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer } from "../layout/FlexContainer";
import { ModalHeader } from "../../atoms/ModalHeader";

import { useShell } from "../../context/ShellContext/ShellContext";

import { NewTemplates } from "../widgets/NewTemplates";
import { WarningMessage } from "../../atoms/callouts/WarningMessage";

export const NewManifestModal: React.FC<{
  close: any;
  save: () => void;
}> = ({ close, save }) => {
  const shellContext = useShell();

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>New Manifest</ModalHeader>
          <Button aria-label="close" onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        {shellContext.unsavedChanges && (
          <WarningMessage $small={true}>
            Loading a manifest from a template will mean you will loose your unsaved changes.
            <Button aria-label="save changes" onClick={() => save()}>
              Save Changes
            </Button>
          </WarningMessage>
        )}
        <NewTemplates
          changeManifest={(id: string) => {
            shellContext.changeSelectedApplication("ManifestEditor");
            shellContext.changeResourceID(id);
            close();
          }}
          newTemplates={shellContext.newTemplates}
        />
      </ModalContainer>
    </>
  );
};
