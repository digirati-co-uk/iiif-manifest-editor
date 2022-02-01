import { Input } from "../atoms/Input";
import { Button } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { useState } from "react";

import { Modal } from "../atoms/Modal";

import styled from "styled-components";

const Container = styled.div`
   {
    position: fixed;
    background: white;
    width: 33%;
    height: auto;
    border-radius: 10px;
    padding: 0.75rem;
    color: rgba(0, 0, 139, 0.7);
    display: flex;
    top: 50%;
    left: 33%;
  }
`;

export const AddManifestModal: React.FC<{
  manifest: string;
  onChange: any;
  close: any;
}> = ({ manifest, onChange, close }) => {
  const [inputValue, setInputValue] = useState(manifest);

  return (
    <Modal>
      <Container>
        <Input
          placeholder={manifest}
          onChange={(e: any) => setInputValue(e.target.value)}
        />
        <Button onClick={() => onChange(inputValue)}>Load Manifest</Button>
        <Button onClick={close}>
          <CloseIcon />
        </Button>
      </Container>
    </Modal>
  );
};
