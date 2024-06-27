import { CreatorFunctionContext, CreatorContext } from "@manifest-editor/creator-api";
import { InputContainer, InputLabel, RichTextLanguageField } from "@manifest-editor/editors";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { useState } from "react";

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
