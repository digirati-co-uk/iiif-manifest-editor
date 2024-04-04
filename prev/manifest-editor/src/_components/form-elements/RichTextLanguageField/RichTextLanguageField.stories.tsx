import { RichTextLanguageField } from "@/_components/form-elements/RichTextLanguageField/RichTextLanguageField";
import { InputContainer, InputLabel } from "@/editors/Input";

export default { title: "Rich Text Language Field", panel: "right" };

export const defaultExample = () => {
  return (
    <div style={{ margin: 20 }}>
      <h3>Rich text field</h3>
      <InputContainer>
        <InputLabel>Value</InputLabel>

        <RichTextLanguageField
          value="This is an example value"
          language="en"
          onUpdate={(newValue) => {
            console.log(newValue);
          }}
          onRemove={() => {
            console.log("removed");
          }}
        />
      </InputContainer>
    </div>
  );
};
