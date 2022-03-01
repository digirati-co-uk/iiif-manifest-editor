import { useState, useEffect } from "react";

import { Input, InputLabel } from "../form/Input";
import { Button, CalltoButton, SecondaryButton } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainer, FlexContainerColumn } from "../layout/FlexContainer";
import { ModalHeader } from "../atoms/ModalHeader";
import { HorizontalDivider } from "../atoms/HorizontalDivider";

import { analyse } from "../../helpers/analyse";
import styled from "styled-components";


const HiddenImage = styled.img`
  display: none;
`;


export const AddManifestModal: React.FC<{
  manifest: string;
  onChange: any;
  close: any;
}> = ({ manifest, onChange, close }) => {
  const [inputValue, setInputValue] = useState(manifest);
  const [inputType, setInputType] = useState<string | undefined>();
  const [label, setLabel] = useState<string | undefined>();
  const [width, setWidth] = useState<number | undefined>();
  const [height, setHeight] = useState<number | undefined>();
  const [imageServiceJSON, setImageServiceJSON] = useState<any>();

  useEffect(() => {
    // Clear the populated value if we use a new url
    setInputType(undefined);
    setLabel(undefined);
    setWidth(undefined);
    setHeight(undefined);
    setImageServiceJSON(undefined);
  }, [inputValue]);

  const handleChange = async () => {
    const inputed = await analyse(inputValue);
    setInputType(inputed?.type);
    setLabel(inputed?.label);
    if (inputed &&
      !(inputed.type === "Manifest" ||
      inputed.type === "Image" ||
      inputed.type !== "Collection")
    ) {
      setImageServiceJSON(inputed);
    }

    // Only handling manifest for now.
    if (inputed && inputed.type === "Manifest") onChange(inputValue);
  };

  const handleImage = (e: any) => {
    setHeight(e.naturalHeight);
    setWidth(e.naturalWidth);
  }

  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainer style={{ justifyContent: "space-between" }}>
          <ModalHeader>Add content</ModalHeader>
          <Button onClick={close}>
            <CloseIcon />
          </Button>
        </FlexContainer>
        <InputLabel>
          From content
          <Input
            placeholder={"Paste URL"}
            onChange={(e: any) => setInputValue(e.target.value)}
          />
        </InputLabel>
        <small>
          Any image, IIIF Image Service, IIIF Manifest or IIIF Collection.{" "}
        </small>
        <HorizontalDivider />
        <FlexContainer style={{ justifyContent: "flex-end" }}>
          <SecondaryButton onClick={() => close()}>CANCEL</SecondaryButton>
          <CalltoButton onClick={() => handleChange()}>ADD</CalltoButton>
        </FlexContainer>
        <br />
        {inputType === "Image" && (
          <HiddenImage
            src={inputValue}
            onLoad={(e: any) => handleImage(e.currentTarget)}
          />
        )}
        {(inputType !== "Manifest" && inputType) && (
          <FlexContainerColumn justify={"flex-start"}>
            <p>This resource is not a manifest.</p>
            <small>{inputType}</small>
            <small>{label}</small>
            <small>{width && `Image width: ${width}`}</small>
            <small>{height && `Image height: ${height}`}</small>
            {imageServiceJSON && (
              <small
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(imageServiceJSON)
                }}
              />
            )}
          </FlexContainerColumn>
        )}
      </ModalContainer>
    </>
  );
};
