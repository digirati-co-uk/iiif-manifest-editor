import { EmptyState, Form } from "@manifest-editor/components";
import type { CreatorDefinition } from "@manifest-editor/creator-api";
import type { FormEvent } from "react";
import { useMemo } from "react";
import { useApp } from "../AppContext/AppContext";
import { type Config, useConfig, useSaveConfig } from "./ConfigContext";

export function CreatorSettings() {
  const app = useApp();
  const config = useConfig();
  const saveConfig = useSaveConfig();
  const creators = useMemo(() => {
    const byId = new Map<string, CreatorDefinition>();
    for (const creator of app.layout.creators || []) {
      if (creator.configuration?.fields.length) {
        byId.set(creator.id, creator);
      }
    }
    return Array.from(byId.values());
  }, [app.layout.creators]);

  function saveCreator(creator: CreatorDefinition, form: HTMLFormElement) {
    const formValues = new FormData(form);
    const nextSettings: Record<string, unknown> = {};

    for (const field of creator.configuration?.fields || []) {
      if (field.type === "checkbox") {
        nextSettings[field.id] = formValues.get(field.id) === "on";
      }
    }

    saveConfig({
      creators: {
        [creator.id]: nextSettings,
      },
    } satisfies Partial<Config>);
  }

  if (!creators.length) {
    return <EmptyState>No creator settings available</EmptyState>;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {creators.map((creator) => (
        <Form.Form
          key={creator.id}
          className="flex flex-col gap-3 border-b border-gray-100 pb-5 last:border-b-0"
          onChange={(e: FormEvent<HTMLFormElement>) => saveCreator(creator, e.currentTarget)}
        >
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-gray-900">{creator.label}</h3>
            {creator.summary ? <p className="text-sm text-gray-500">{creator.summary}</p> : null}
          </div>

          {creator.configuration?.fields.map((field) => {
            const value = config.creators?.[creator.id]?.[field.id];
            const fieldId = `${creator.id}-${field.id}`;

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
                    <Form.Label htmlFor={fieldId}>{field.label}</Form.Label>
                    {field.summary ? <p className="text-sm text-gray-500">{field.summary}</p> : null}
                  </div>
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
