import { FeaturedCardStyles as S } from "./FeaturedCard.styles";
import { ReactNode } from "react";
import { CalltoButton } from "@manifest-editor/ui/atoms/Button";

export interface FeaturedCardProps {
  label: string;
  thumbnail?: ReactNode;
  actionLabel: string;
  onClick?: () => void;
}

export function FeaturedCard(props: FeaturedCardProps) {
  return (
    <S.Container onClick={props.onClick}>
      {props.thumbnail ? <S.Thumbnail>{props.thumbnail}</S.Thumbnail> : null}
      <S.Label>{props.label}</S.Label>
      <S.Action>
        <CalltoButton>{props.actionLabel}</CalltoButton>
      </S.Action>
    </S.Container>
  );
}
