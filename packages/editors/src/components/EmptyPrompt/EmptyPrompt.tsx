import { Button } from "@manifest-editor/ui/atoms/Button";


interface EmptyPromptProps {
  children: any;
  action: { id?: string; label: string; onClick: () => void };
}

export function EmptyPrompt(props: EmptyPromptProps) {
  return (
    <div className="bg-[#e4e7f0] py-4 px-2 rounded text-center font-medium [&_button]:my-4 [&_button]:mx-auto">
      {props.children}
      <br />
      <Button id={props.action.id} onClick={props.action.onClick}>
        {props.action.label}
      </Button>
    </div>
  );
}
