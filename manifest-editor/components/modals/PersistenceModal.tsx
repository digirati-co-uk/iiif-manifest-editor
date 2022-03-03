import { Input } from "../form/Input";
import { Button, CalltoButton } from "../atoms/Button";
import { CloseIcon } from "../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainerColumn, FlexContainerRow } from "../layout/FlexContainer";
import { CopyURL } from "../atoms/CopyURL";


export const PersistenceModal: React.FC<{
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
          <CopyURL manifest={manifest} link={link}/>
          <p>
            <small>
              This preview will expire in 48 hours. For a permanent version,
              select Permalink from the File / Save As menu option.
            </small>
          </p>
          <label>
            <Input
              type={"checkbox"}
              checked={value}
              onChange={(e: any) => onChange(e.target.value)}
            />
            <span>Don't show this again</span>
          </label>
          <FlexContainerRow justify={"flex-end"}>
            <CalltoButton>
              <a href={link} target={"_blank"} rel="noreferrer" onClick={close}>
                PREVIEW
              </a>
            </CalltoButton>
          </FlexContainerRow>
        </FlexContainerColumn>
      </ModalContainer>
    </>
  );
};
