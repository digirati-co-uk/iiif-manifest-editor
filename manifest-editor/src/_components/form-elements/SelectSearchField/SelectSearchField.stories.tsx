import { SelectSearchField } from "@/_components/form-elements/SelectSearchField/SelectSearchField";
import { InputContainer, InputLabel } from "@/editors/Input";
import { SelectSearchOption } from "react-select-search";

export default { title: "Select search field", panel: "right" };

export const ExampleRights = () => {
  const options: SelectSearchOption[] = [
    { name: "English", value: "en", type: "Testing type" },
    { name: "Swedish", value: "sv", type: "Testing type" },
  ];
  return (
    <div style={{ margin: 20 }}>
      <InputContainer>
        <InputLabel>Rights field</InputLabel>
        <SelectSearchField options={options} />
      </InputContainer>
    </div>
  );
};
