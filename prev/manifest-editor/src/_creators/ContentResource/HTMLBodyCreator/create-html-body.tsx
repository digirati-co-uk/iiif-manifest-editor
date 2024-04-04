import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { CreatorContext, CreatorFunctionContext } from "@/creator-api/types";
import { InputContainer, InputLabel, Input } from "@/editors/Input";
import { useState } from "react";
import { RichTextLanguageField } from "@/_components/form-elements/RichTextLanguageField/RichTextLanguageField";

export interface CreateHTMLBodyPayload {
  language?: string;
  body: string;
}

export async function createHtmlBody(data: CreateHTMLBodyPayload, ctx: CreatorFunctionContext) {
  return ctx.embed({
    id: ctx.generateId(`html/${data.language}`),
    language: data.language,
    type: "TextualBody",
    format: "text/html",
    value: data.body || "",
  });
}

export function CreateHTMLBodyForm(props: CreatorContext<CreateHTMLBodyPayload>) {
  const [body, setBodyValue] = useState<string>("<p></p>");
  const [language, setLang] = useState("en");

  const onSubmit = () => {
    props.runCreate({
      language,
      body,
    });
  };

  return (
    <PaddedSidebarContainer>
      <InputContainer>
        <InputLabel>HTML Body</InputLabel>

        <RichTextLanguageField
          value={body}
          language={language}
          onUpdateLanguage={(lng) => setLang(lng)}
          languages={["en", "nl", "cy"]}
          onUpdate={(e) => setBodyValue(e)}
        />
      </InputContainer>

      <Button onClick={() => onSubmit()}>Create</Button>
    </PaddedSidebarContainer>
  );
}
