import type { MouseEvent, ReactNode } from "react";
import { RichMediaLinkStyles } from "./RichMediaLink.styles";

export interface RichMediaLinkProps {
  icon?: string | ReactNode;
  margin?: boolean;
  iconLabel?: string;
  title: string | ReactNode;
  link: string;
  noLink?: boolean;
  isVisible?: boolean;
  label?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
  containerProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}

export function RichMediaLink(props: RichMediaLinkProps) {
  return (
    <RichMediaLinkStyles.Container
      data-margin={props.margin}
      data-visible={props.isVisible === false ? "false" : "true"}
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
        {props.noLink ? (
          <RichMediaLinkStyles.NoLink>{props.link}</RichMediaLinkStyles.NoLink>
        ) : (
          <RichMediaLinkStyles.Link href={props.link}>{props.link}</RichMediaLinkStyles.Link>
        )}
      </RichMediaLinkStyles.Content>
    </RichMediaLinkStyles.Container>
  );
}
