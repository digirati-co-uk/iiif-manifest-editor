import { ButtonGroup } from "../atoms/Button";
import { InformationLink } from "../atoms/InformationLink";
import { ShadowContainer } from "../atoms/ShadowContainer";
import { HiddenCheckbox, InputLabel, MutliselectLabel } from "./Input";

export const StringSelector: React.FC<{
  options: string[] | null;
  label: string;
  selected: string | string[] | null;
  changeHandler: (value: string) => void;
  multi?: boolean;
  guidanceReference?: string;
}> = ({
  options,
  label,
  selected,
  changeHandler,
  multi = true,
  guidanceReference,
}) => {
  return (
    <ShadowContainer>
      <InputLabel>{label}</InputLabel>
      <ButtonGroup>
        {options &&
          options.map((choice) => {
            return (
              <MutliselectLabel $selected={selected?.includes(choice)}>
                {choice}
                <HiddenCheckbox
                  type={multi ? "checkbox" : "radio"}
                  checked={selected?.includes(choice)}
                  onChange={() => changeHandler(choice)}
                />
              </MutliselectLabel>
            );
          })}
      </ButtonGroup>

      {guidanceReference && (
        <InformationLink guidanceReference={guidanceReference} />
      )}
    </ShadowContainer>
  );
};
