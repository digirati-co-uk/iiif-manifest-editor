import { MouseEvent, ReactNode } from "react";
import { RichMediaLinkStyles } from "./RichMediaLink.styles";

export interface RichMediaLinkProps {
  icon?: string | ReactNode;
  iconLabel?: string;
  title: string | ReactNode;
  link: string;
  label?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  containerProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}

export function RichMediaLink(props: RichMediaLinkProps) {
  return (
    <RichMediaLinkStyles.Container
      onClick={props.onClick}
      $interactive={!!props.onClick}
      {...((props.containerProps as any) || {})}
    >
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
