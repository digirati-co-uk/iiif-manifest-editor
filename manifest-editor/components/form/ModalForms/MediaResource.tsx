import { Button } from "../../atoms/Button";
import { ModalHeader } from "../../atoms/ModalHeader";
import { CloseIcon } from "../../icons/CloseIcon";
import { FlexContainer } from "../../layout/FlexContainer";
import { ModalBackground } from "../../layout/ModalBackground";
import { ModalContainer } from "../../layout/ModalContainer";

type MediaEditorProps = {
  close: () => void;
};
export const MediaResouceEditorModal: React.FC<MediaEditorProps> = ({
  close,
}) => {
  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>Media</ModalHeader>
          <Button aria-label="close" onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
      </ModalContainer>
    </>
  );
};
