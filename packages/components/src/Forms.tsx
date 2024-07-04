import { Label, Form as RAForm, Input, LabelProps } from "react-aria-components";
import { cn } from "./utils";

function MeLabel({ className, ...props }: LabelProps) {
  return (
    <Label
      className={cn(
        //
        "font-semibold text-sm",
        className
      )}
      {...props}
    />
  );
}

function MeForm({ className, ...props }: any) {
  return (
    <RAForm
      className={cn(
        //
        "",
        className
      )}
      {...props}
    />
  );
}

function MeInput({ className, ...props }: any) {
  return (
    <Input
      className={cn(
        //
        "p-2 bg-me-gray-100 border-b border-b-me-gray-500",
        "focus:ring-0 outline-0 focus:border-me-primary-500 focus:bg-[#ECEEF5]",
        className
      )}
      {...props}
    />
  );
}

function MeInputContainer({
  horizontal,
  className,
  ...props
}: React.HTMLProps<HTMLDivElement> & { horizontal?: boolean }) {
  return (
    <div
      className={cn(
        //
        "flex flex-col gap-2",
        horizontal && "flex-row",
        className
      )}
      {...props}
    />
  );
}

export const Form = {
  Input: MeInput,
  Form: MeForm,
  Label: MeLabel,
  InputContainer: MeInputContainer,
};
