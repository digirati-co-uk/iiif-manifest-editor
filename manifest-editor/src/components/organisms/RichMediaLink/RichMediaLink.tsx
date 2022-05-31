import { MouseEvent, ReactNode } from "react";
import { RichMediaLinkStyles } from "./RichMediaLink.styles";

export interface RichMediaLinkProps {
  icon?: string | ReactNode;
  iconLabel?: string;
  title: string;
  link: string;
  label?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function RichMediaLink(props: RichMediaLinkProps) {
  return (
    <RichMediaLinkStyles.Container onClick={props.onClick} $interactive={!!props.onClick}>
      <RichMediaLinkStyles.Icon>
        {typeof props.icon === "string" ? <img src={props.icon} alt={props.iconLabel || ""} /> : props.icon}
      </RichMediaLinkStyles.Icon>
      <RichMediaLinkStyles.Content>
        <RichMediaLinkStyles.TitleContainer>
          <RichMediaLinkStyles.Title>{props.title}</RichMediaLinkStyles.Title>
          <RichMediaLinkStyles.Label>{props.label}</RichMediaLinkStyles.Label>
        </RichMediaLinkStyles.TitleContainer>
        <RichMediaLinkStyles.Link href={props.link}>{props.link}</RichMediaLinkStyles.Link>
      </RichMediaLinkStyles.Content>
    </RichMediaLinkStyles.Container>
  );
}
