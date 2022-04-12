import { useState } from "react";
import { Button, CalltoButton, SecondaryButton } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer } from "../layout/FlexContainer";
import { ModalHeader } from "../atoms/ModalHeader";
import { HorizontalDivider } from "../atoms/HorizontalDivider";

import { RadioButtons } from "../atoms/RadioButtons";
import { CopyURL } from "../atoms/CopyURL";

export const SaveModal: React.FC<{
  close: any;
  save: () => void;
  previouslySaved: boolean;
  permalink: string | undefined;
  saveAsChoice: number;
  setSaveAsChoice: (number: number) => void;
}> = ({
  close,
  save,
  previouslySaved,
  permalink,
  saveAsChoice,
  setSaveAsChoice,
}) => {
  const [saveClicked, setSaveClicked] = useState(false);
  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>Permalink</ModalHeader>
          <Button aria-label="close" onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        {!previouslySaved && (
          <>
            <small>
              <i>A new URL will be created for the Manifest on first save</i>
            </small>
          </>
        )}
        {previouslySaved && (
          <RadioButtons
            options={[
              { label: `Replace ${permalink}`, value: "replace" },
              { label: "Create a new permalink", value: "create" },
              {
                label: "Save to your browser's local storage",
                value: "createLS",
              },
            ]}
            onChange={(index: number) => {
              setSaveAsChoice(index);
            }}
            selectedIndex={saveAsChoice}
          />
        )}
        <HorizontalDivider />

        <FlexContainer style={{ justifyContent: "flex-end" }}>
          <SecondaryButton aria-label="cancel" onClick={() => close()}>
            CANCEL
          </SecondaryButton>
          <CalltoButton
            aria-label="save"
            onClick={() => {
              save();
              setSaveClicked(true);
              if (saveAsChoice === 2) close();
            }}
          >
            SAVE
          </CalltoButton>
        </FlexContainer>
        {saveClicked && saveAsChoice !== 2 && (
          <>
            <HorizontalDivider />
            <small>The manifest has been saved to the permalink here:</small>
            <CopyURL manifest={permalink || ""} link={permalink || ""} />
          </>
        )}
      </ModalContainer>
    </>
  );
};
