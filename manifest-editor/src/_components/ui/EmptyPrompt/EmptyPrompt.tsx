import { Button } from "@/atoms/Button";
import { promptContainer } from "./EmptyPrompt.styles";

interface EmptyPromptProps {
  children: any;
  action: { id?: string; label: string; onClick: () => void };
}

export function EmptyPrompt(props: EmptyPromptProps) {
  return (
    <div className={promptContainer}>
      {props.children}
      <br />
      <Button id={props.action.id} onClick={props.action.onClick}>
        {props.action.label}
      </Button>
    </div>
  );
}
