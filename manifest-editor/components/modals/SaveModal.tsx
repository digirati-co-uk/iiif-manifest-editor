import { Button, CalltoButton, SecondaryButton } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer } from "../layout/FlexContainer";
import { ModalHeader } from "../atoms/ModalHeader";
import { HorizontalDivider } from "../atoms/HorizontalDivider";


export const SaveModal: React.FC<{
  close: any;
}> = ({ close }) => {

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>Permalink</ModalHeader>
          <Button onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        <HorizontalDivider />
        <small>
          <i>A new URL will be created for the Manifest on first save</i>
        </small>
        <FlexContainer style={{ justifyContent: "flex-end" }}>
          <SecondaryButton onClick={() => close()}>CANCEL</SecondaryButton>
          <CalltoButton onClick={() => {}}>SAVE</CalltoButton>
        </FlexContainer>
        <br />
      </ModalContainer>
    </>
  );
};
