import styled from "styled-components";

export const DropdownItem = styled.option`
   {
    padding: 0.12em;
    border: none;
    cursor: pointer;
    &:hover {
      background-color: lightgrey;
    }
  }
`;


export const StyledSelect = styled.select`
  display: flex;
  align-items: center;
  border: 0.0375rem solid grey;
  border-radius: 0.0375rem;
  height: 100%;
  text-align: right;
  justify-content: flex-end;
  padding: none;
`;

export const SelectMenuContainer = styled.div`
  display: inline;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  position: relative;
  height: 2rem;
`;

export const LanguageSelector: React.FC<{
  options: Array<string>;
  setLanguage: (value: string) => void;
  selected: string;
}> = ({ options, setLanguage, selected }) => {
  const clickHandler = (lang: string) => {
    setLanguage(lang);
  };

  return (
    <SelectMenuContainer>
      <StyledSelect
        defaultValue={selected}
        onChange={(e: any) => clickHandler(e.target.value)}
      >
        {options.map((option: string) => {
          return (
            <DropdownItem
              key={option}
              onClick={(e: any) => clickHandler(e.target.value)}
              value={option}
              label={option}
            />
          );
        })}
      </StyledSelect>
    </SelectMenuContainer>
  );
};
