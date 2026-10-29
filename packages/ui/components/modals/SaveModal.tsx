import { useTranslations } from "@manifest-editor/i18n";
import { useState } from "react";
import { Button, CalltoButton, SecondaryButton } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer } from "../layout/FlexContainer";
import { ModalHeader } from "../../atoms/ModalHeader";
import { HorizontalDivider } from "../../atoms/HorizontalDivider";

import { RadioButtons } from "../../atoms/RadioButtons";
import { CopyURL } from "../../atoms/CopyURL";

export const SaveModal: React.FC<{
  close: any;
  save: () => void;
  previouslySaved: boolean;
  permalink: string | undefined;
  saveAsChoice: number;
  setSaveAsChoice: (number: number) => void;
}> = ({ close, save, previouslySaved, permalink, saveAsChoice, setSaveAsChoice }) => {
  const t = useTranslations("ui");
  const [saveClicked, setSaveClicked] = useState(false);
  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>{t("save.permalink")}</ModalHeader>
          <Button aria-label={t("actions.close")} onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        {!previouslySaved && (
          <>
            <small>
              <i>{t("save.first")}</i>
            </small>
          </>
        )}
        {previouslySaved && (
          <RadioButtons
            options={[
              { label: t("save.replace", { url: permalink || "" }), value: "replace" },
              { label: t("save.create"), value: "create" },
              {
                label: t("save.local"),
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
          <SecondaryButton aria-label={t("actions.cancel")} onClick={() => close()}>
            {t("actions.cancel")}
          </SecondaryButton>
          <CalltoButton
            aria-label={t("actions.save")}
            onClick={() => {
              save();
              setSaveClicked(true);
              if (saveAsChoice === 2) {
                close();
              }
            }}
          >
            {t("actions.save")}
          </CalltoButton>
        </FlexContainer>
        {saveClicked && saveAsChoice !== 2 && (
          <>
            <HorizontalDivider />
            <small>{t("save.saved")}</small>
            <CopyURL manifest={permalink || ""} link={permalink || ""} />
          </>
        )}
      </ModalContainer>
    </>
  );
};
