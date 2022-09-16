import { RichTextLanguageField } from "@/_components/form-elements/RichTextLanguageField/RichTextLanguageField";

export default { title: "Rich Text Language Field", panel: "right" };

export const defaultExample = () => {
  return (
    <div style={{ margin: 20 }}>
      <h3>Rich text field</h3>
      <RichTextLanguageField
        value="This is an example value"
        language="none"
        onUpdate={(newValue, newLanguage) => {
          console.log(newValue, newLanguage);
        }}
        onRemove={() => {
          console.log("removed");
        }}
      />
    </div>
  );
};
