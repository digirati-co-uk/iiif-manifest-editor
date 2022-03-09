import { Input } from "../form/Input";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
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
        <Input
          placeholder={manifest}
          onChange={(e: any) => setInputValue(e.target.value)}
        />
        <Button onClick={() => onChange()}>Load Manifest</Button>
        <Button onClick={close}>
          <CloseIcon />
        </Button>
      </ModalContainer>
    </>
  );
};
