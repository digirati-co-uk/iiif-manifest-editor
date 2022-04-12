import { InformationLink } from "../atoms/InformationLink";
import { AddIcon } from "../icons/AddIcon";
import { CheckIcon } from "../icons/CheckIcon";
import { FlexContainer } from "../layout/FlexContainer";
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
    <>
      <InputLabel>{label}</InputLabel>
      <FlexContainer style={{ flexWrap: "wrap" }}>
        {options &&
          options.map((choice) => {
            return (
              <MutliselectLabel $selected={selected?.includes(choice)}>
                {choice}
                {selected?.includes(choice) && multi ? (
                  <CheckIcon />
                ) : (
                  multi && <AddIcon />
                )}
                {selected?.includes(choice) && !multi && <CheckIcon />}
                <HiddenCheckbox
                  type={multi ? "checkbox" : "radio"}
                  checked={selected?.includes(choice)}
                  onChange={() => changeHandler(choice)}
                />
              </MutliselectLabel>
            );
          })}
      </FlexContainer>

      {guidanceReference && (
        <InformationLink guidanceReference={guidanceReference} />
      )}
    </>
  );
};
