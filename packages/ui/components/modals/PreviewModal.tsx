import { useTranslations } from "@manifest-editor/i18n";
import { Input, InputLabel } from "../../editors/Input";
import { Button, CalltoButton } from "../../atoms/Button";
import { CloseIcon } from "../../icons/CloseIcon";
import { ModalBackground } from "../layout/ModalBackground";
import { ModalContainer } from "../layout/ModalContainer";
import { FlexContainerColumn, FlexContainerRow } from "../layout/FlexContainer";
import { CopyURL } from "../../atoms/CopyURL";
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
  const t = useTranslations("ui");
  return (
    <>
      <ModalBackground />
      <ModalContainer>
        <FlexContainerColumn justify={"flex-start"}>
          <FlexContainerRow justify={"space-between"}>
            <h3>{t("preview.title")}</h3>
            <Button aria-label={t("actions.close")} onClick={close}>
              <CloseIcon />
            </Button>
          </FlexContainerRow>
          <p>{t("preview.available")}</p>
          <CopyURL manifest={manifest} link={link} />
          <p>
            <small>{t("preview.expiry")}</small>
          </p>
          <FlexContainerRow justify={"space-between"}>
            <InputLabel>
              <Input type={"checkbox"} checked={value} onChange={(e: any) => onChange(e.target.value)} />
              <span>{t("preview.hide")}</span>
            </InputLabel>
            <CalltoButton aria-label={t("preview.action")}>
              <Link href={link} target={"_blank"} rel="noreferrer" onClick={close}>
                {t("preview.action")}
              </Link>
            </CalltoButton>
          </FlexContainerRow>
        </FlexContainerColumn>
      </ModalContainer>
    </>
  );
};
