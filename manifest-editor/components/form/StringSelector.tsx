import styled from "styled-components";
import { ButtonGroup } from "../atoms/Button";
import { HorizontalDivider } from "../atoms/HorizontalDivider";
import { HiddenCheckbox, InputLabel, MutliselectLabel } from "./Input";

const Container = styled.div`
  box-shadow: ${(props: any) => props.theme.shadows.standard || ""};
  padding: ${(props: any) => props.theme.padding.medium || "1rem"};
`;

export const StringSelector: React.FC<{
  options: string[];
  label: string;
  selected: string[];
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
    <Container>
      <InputLabel>{label}</InputLabel>
      <ButtonGroup>
        {options.map((choice) => {
          return (
            <MutliselectLabel $selected={selected.includes(choice)}>
              {choice}
              <HiddenCheckbox
                type={multi ? "checkbox" : "radio"}
                checked={selected.includes(choice)}
                onChange={() => changeHandler(choice)}
              />
            </MutliselectLabel>
          );
        })}
      </ButtonGroup>

      {guidanceReference && (
        <>
          <HorizontalDivider />
          <a
            href={guidanceReference}
            target={"_blank"}
            rel="noopener noreferrer"
          >
            Further guidance
          </a>
        </>
      )}
    </Container>
  );
};
