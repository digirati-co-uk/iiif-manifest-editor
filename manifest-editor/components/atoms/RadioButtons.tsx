import styled from "styled-components";

export const RadioLabel = styled.label`
  display: block;
  color: #000;
  text-decoration: none;
  padding: 0.4em 0.75em;
  white-space: nowrap;
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
            <input
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
