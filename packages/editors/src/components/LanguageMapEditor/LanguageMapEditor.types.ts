export interface LanguageMapEditorProps {
  dispatchType: "label" | "summary";
  languages?: Array<string>;
  guidanceReference?: string;
  disableMultiline?: boolean;
  formElement?: boolean;
  name?: string;
  id?: string;
}
