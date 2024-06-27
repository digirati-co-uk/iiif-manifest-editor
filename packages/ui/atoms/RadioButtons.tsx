import styled from "styled-components";
import { Input } from "./Input";

export const RadioLabel = styled.label`
  display: block;
  color: ${(props: any) => props.theme.color.black || "black"};
  text-decoration: none;
  padding: ${(props: any) => props.theme.padding.small || "none"};
  &:hover,
  &:focus {
    outline: none;
  }
`;

type LabelValue = { label: any; value: string };

export const RadioButtons: React.FC<{
  options: Array<LabelValue>;
  selectedIndex: number;
  onChange: (index: number) => void;
}> = ({ options, selectedIndex = 0, onChange }) => {
  return (
    <div>
      {options.map((item: LabelValue, index: number) => {
        return (
          <RadioLabel key={item.label}>
            <Input
              type="radio"
              checked={selectedIndex === index}
              onChange={() => {
                onChange(index);
              }}
            />
            {item.label}
          </RadioLabel>
        );
      })}
    </div>
  );
};
