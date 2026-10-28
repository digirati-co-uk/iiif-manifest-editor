import { useTranslations } from "@manifest-editor/i18n";
import { Input } from "../../editors/Input";
import { Button } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";
import { useState } from "react";

import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { analyse } from "../../helpers/analyse";

export const AddModal: React.FC<{
  manifest: string;
  // onChange: any;
  close: any;
}> = ({ manifest, close }) => {
  const t = useTranslations("ui");
  const [inputValue, setInputValue] = useState(manifest);

  const onChange = () => {
    analyse(inputValue);
  };

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <h2>{t("load.manifest")}</h2>
        <Input placeholder={manifest} onChange={(e: any) => setInputValue(e.target.value)} />
        <Button aria-label={t("load.manifest")} onClick={() => onChange()}>
          {t("load.manifest")}
        </Button>
        <Button aria-label={t("actions.close")} onClick={close}>
          <CloseIcon />
        </Button>
      </ModalContainer>
    </>
  );
};
