import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { EmptyState, Form } from "@manifest-editor/components";
import { type CreatorDefinition, getCreatorConfigKey } from "@manifest-editor/creator-api";
import type { FormEvent } from "react";
import { useMemo } from "react";
import { useApp } from "../AppContext/AppContext";
import { type Config, useConfig, useSaveConfig } from "./ConfigContext";
import { formatStringListSetting, getCreatorSettings, parseStringListSetting } from "./CreatorSettings.helpers";

export function CreatorSettings() {
  const { resolveMessage } = useEditorI18n();

  const t = useTranslations("shell");

  const app = useApp();
  const config = useConfig();
  const saveConfig = useSaveConfig();
  const creators = useMemo(() => {
    return getCreatorSettings(app.layout.creators || []);
  }, [app.layout.creators]);

  function saveCreator(creator: CreatorDefinition, form: HTMLFormElement) {
    const configKey = getCreatorConfigKey(creator);
    const formValues = new FormData(form);
    const nextSettings: Record<string, unknown> = {};

    for (const field of creator.configuration?.fields || []) {
      if (field.type === "checkbox") {
        nextSettings[field.id] = formValues.get(field.id) === "on";
      } else if (field.type === "string-list") {
        // Blank => undefined so the creator falls back to its default (e.g. import everything).
        nextSettings[field.id] = parseStringListSetting(formValues.get(field.id) as string | null);
      }
    }

    saveConfig({
      creators: {
        [configKey]: nextSettings,
      },
    } satisfies Partial<Config>);
  }

  if (!creators.length) {
    return <EmptyState>{t("settings.noCreators")}</EmptyState>;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {creators.map((creator) => (
        <Form.Form
          key={getCreatorConfigKey(creator)}
          className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-b-0"
          onChange={(e: FormEvent<HTMLFormElement>) => saveCreator(creator, e.currentTarget)}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-900">
              {resolveMessage(creator?.labelMessage, creator.label)}
            </h3>
            {resolveMessage(creator?.summaryMessage, creator.summary) ? (
              <p className="text-sm text-gray-500">{resolveMessage(creator?.summaryMessage, creator.summary)}</p>
            ) : null}
          </div>

          {creator.configuration?.fields.map((field) => {
            const configKey = getCreatorConfigKey(creator);
            const value = config.creators?.[configKey]?.[field.id];
            const fieldId = `${configKey}-${field.id}`;

            if (field.type === "checkbox") {
              return (
                <Form.InputContainer key={field.id} horizontal className="my-1 items-start">
                  <Form.Input
                    type="checkbox"
                    name={field.id}
                    id={fieldId}
                    defaultChecked={typeof value === "boolean" ? value : field.defaultValue || false}
                  />
                  <div className="flex flex-col gap-1">
                    <Form.Label htmlFor={fieldId}>{resolveMessage(field?.labelMessage, field.label)}</Form.Label>
                    {resolveMessage(field?.summaryMessage, field.summary) ? (
                      <p className="text-sm text-gray-500">{resolveMessage(field?.summaryMessage, field.summary)}</p>
                    ) : null}
                  </div>
                </Form.InputContainer>
              );
            }

            if (field.type === "string-list") {
              const summary = resolveMessage(field?.summaryMessage, field.summary);
              return (
                <Form.InputContainer key={field.id} className="my-1">
                  <Form.Label htmlFor={fieldId}>{resolveMessage(field?.labelMessage, field.label)}</Form.Label>
                  <Form.TextArea
                    name={field.id}
                    id={fieldId}
                    rows={4}
                    defaultValue={formatStringListSetting(value, field.defaultValue)}
                    aria-describedby={summary ? `${fieldId}-summary` : undefined}
                  />
                  {summary ? (
                    <p id={`${fieldId}-summary`} className="text-sm text-gray-500">
                      {summary}
                    </p>
                  ) : null}
                </Form.InputContainer>
              );
            }

            return null;
          })}
        </Form.Form>
      ))}
    </div>
  );
}
