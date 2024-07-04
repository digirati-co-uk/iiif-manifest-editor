import { Label, Form as RAForm, Input, LabelProps, RadioGroup, Radio } from "react-aria-components";
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

function MeRadioGroup({ className, ...props }: any) {
  return (
    <RadioGroup
      className={cn(
        //
        "",
        className
      )}
      {...props}
    />
  );
}

function MeRadio({ className, ...props }: any) {
  return (
    <Radio
      className={(state) =>
        cn(
          //
          "outline outline-me-primary-500 outline-offset-2 w-5 h-5 rounded-full bg-white transition-all border-[7px] border-gray-700 group-pressed:border-gray-800 outline-0",
          className
        )
      }
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
  RadioGroup: MeRadioGroup,
  Radio: MeRadio,
};
