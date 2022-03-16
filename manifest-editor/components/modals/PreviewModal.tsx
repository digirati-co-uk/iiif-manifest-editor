import { Input, InputLabel } from "../form/Input";
import { Button, CalltoButton } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainerColumn, FlexContainerRow } from "../layout/FlexContainer";
import { CopyURL } from "../atoms/CopyURL";
import styled from "styled-components";

const Link = styled.a`
  color: inherit;
  text-decoration: none;
`;

export const PreviewModal: React.FC<{
  manifest: string;
  onChange: any;
  close: any;
  value: boolean;
  link: string;
}> = ({ manifest, onChange, close, value, link }) => {
  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainerColumn justify={"flex-start"}>
          <FlexContainerRow justify={"space-between"}>
            <h3>Preview IIIF Manifest</h3>
            <Button onClick={close}>
              <CloseIcon />
            </Button>
          </FlexContainerRow>
          <p>A preview of this Manifest is now available at: </p>
          <CopyURL manifest={manifest} link={link} />
          <p>
            <small>
              This preview will expire in 48 hours. For a permanent version,
              select Permalink from the File / Save As menu option.
            </small>
          </p>
          <InputLabel>
            <Input
              type={"checkbox"}
              checked={value}
              onChange={(e: any) => onChange(e.target.value)}
            />
            <span>Don't show this again</span>
          </InputLabel>
          <FlexContainerRow justify={"flex-end"}>
            <CalltoButton>
              <Link
                href={link}
                target={"_blank"}
                rel="noreferrer"
                onClick={close}
              >
                PREVIEW
              </Link>
            </CalltoButton>
          </FlexContainerRow>
        </FlexContainerColumn>
      </ModalContainer>
    </>
  );
};
