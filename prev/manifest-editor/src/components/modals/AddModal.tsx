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
  const [inputValue, setInputValue] = useState(manifest);

  const onChange = () => {
    analyse(inputValue);
  };

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <h2>Something</h2>
        <Input placeholder={manifest} onChange={(e: any) => setInputValue(e.target.value)} />
        <Button aria-label="load manifest" onClick={() => onChange()}>
          Load Manifest
        </Button>
        <Button aria-label="close icon" onClick={close}>
          <CloseIcon />
        </Button>
      </ModalContainer>
    </>
  );
};
