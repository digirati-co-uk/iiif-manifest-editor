import { ActionButton } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { InputContainer, InputLabel, RichTextLanguageField } from "@manifest-editor/editors";
import { useConfig } from "@manifest-editor/shell";
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
  const { i18n } = useConfig();
  const [body, setBodyValue] = useState<string>("<p></p>");
  const [language, setLang] = useState(i18n.defaultLanguage);

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
          languages={i18n.availableLanguages}
          onUpdate={(e) => setBodyValue(e)}
        />
      </InputContainer>

      <ActionButton primary large type="button" onPress={onSubmit}>
        Create
      </ActionButton>
    </PaddedSidebarContainer>
  );
}
