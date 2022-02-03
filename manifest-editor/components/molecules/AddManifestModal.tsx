import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { useState } from "react";

import { ModalBackground } from "../atoms/ModalBackground";
import { ModalContainer } from "../atoms/ModalContainer";

export const AddManifestModal: React.FC<{
  manifest: string;
  onChange: any;
  close: any;
}> = ({ manifest, onChange, close }) => {
  const [inputValue, setInputValue] = useState(manifest);

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <Input
          placeholder={manifest}
          onChange={(e: any) => setInputValue(e.target.value)}
        />
        <Button onClick={() => onChange(inputValue)}>Load Manifest</Button>
        <Button onClick={close}>
          <CloseIcon />
        </Button>
      </ModalContainer>
    </>
  );
};
