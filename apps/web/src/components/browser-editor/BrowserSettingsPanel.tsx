"use client";

import { ActionButton, Form } from "@manifest-editor/components";
import {
  type Config,
  PluginManager,
  useAppResource,
  useConfig,
  useDecayState,
  usePreviewContext,
  useSaveConfig,
} from "@manifest-editor/shell";
import { useState } from "react";

type SettingsSection = "general" | "preview" | "editor" | "export" | "plugins";

const sections: Array<{ id: SettingsSection; label: string }> = [
  { id: "general", label: "General" },
  { id: "preview", label: "Preview" },
  { id: "editor", label: "Editor" },
  { id: "export", label: "Export" },
  { id: "plugins", label: "Plugins" },
];

export function BrowserSettingsPanel() {
  const previews = usePreviewContext();
  const resource = useAppResource();
  const config = useConfig();
  const setConfig = useSaveConfig();
  const [section, setSection] = useState<SettingsSection>("general");
  const [isSaved, saveState] = useDecayState(2000);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formValues = new FormData(e.target as HTMLFormElement);
    const nextConfig: Partial<Config> = { plugins: config.plugins };

    if (section === "general") {
      nextConfig.i18n = {
        ...(config.i18n || ({} as any)),
        advancedLanguageMode: formValues.get("advancedLanguageMode") === "on",
        textGranularityEnabled: formValues.get("textGranularityEnabled") === "on",
        availableLanguages: ((formValues.get("availableLanguages") as string) || "")
          .split(",")
          .map((t: string) => t.trim()),
        defaultLanguage: formValues.get("defaultLanguage") as string,
      };
    }

    if (section === "preview") {
      nextConfig.defaultPreview = formValues.get("defaultPreview") as string;
    }

    if (section === "editor") {
      nextConfig.editorFeatureFlags = {
        ...(config.editorFeatureFlags || ({} as any)),
        rememberCanvasId: formValues.get("rememberCanvasId") === "on",
        rememberLeftPanelId: formValues.get("rememberLeftPanelId") === "on",
        manifestGridOptions: formValues.get("manifestGridOptions") === "on",
      };
    }

    if (section === "export") {
      nextConfig.export = {
        ...(config.export || ({} as any)),
        version: formValues.get("isVersion2") === "on" ? 2 : 3,
        baseIdentifier: (formValues.get("base") as string) || null,
      };
    }

    setConfig(nextConfig);
    saveState.set();
    saveState.clear();
  }

  return (
    <div className="flex h-[70vh] min-h-[60vh] overflow-hidden border-t border-gray-100 bg-white w-full">
      <nav className="w-52 flex-none border-r border-gray-200 bg-gray-50 p-3" aria-label="Settings sections">
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Settings</div>
        <div className="flex flex-col gap-1">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className={[
                "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                section === item.id ? "bg-white text-me-primary-600 shadow-sm" : "text-gray-600 hover:bg-white",
              ].join(" ")}
              onClick={() => setSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        {section === "plugins" ? (
          <SettingsSection title="Plugins">
            <PluginManager />
          </SettingsSection>
        ) : (
          <Form.Form onSubmit={onSubmit} className="flex max-w-3xl flex-col gap-6">
            {isSaved ? (
              <div className="rounded-md bg-me-primary-500 px-3 py-2 text-sm text-white">Changes saved</div>
            ) : null}

            {section === "general" ? (
              <SettingsSection title="General">
                <Form.InputContainer>
                  <Form.Label htmlFor="defaultLanguage">Default language</Form.Label>
                  <Form.Input
                    type="text"
                    name="defaultLanguage"
                    id="defaultLanguage"
                    defaultValue={config.i18n?.defaultLanguage || ""}
                  />
                </Form.InputContainer>

                <Form.InputContainer>
                  <Form.Label htmlFor="availableLanguages">Available languages</Form.Label>
                  <Form.Input
                    type="text"
                    name="availableLanguages"
                    id="availableLanguages"
                    defaultValue={(config.i18n?.availableLanguages || []).join(", ")}
                  />
                </Form.InputContainer>

                <Checkbox
                  name="advancedLanguageMode"
                  label="Advanced language mode"
                  checked={config.i18n?.advancedLanguageMode || false}
                />
                <Checkbox
                  name="textGranularityEnabled"
                  label="Enable text granularity"
                  checked={config.i18n?.textGranularityEnabled || false}
                />
              </SettingsSection>
            ) : null}

            {section === "preview" ? (
              <SettingsSection title="Preview">
                <Form.InputContainer>
                  <Form.Label htmlFor="defaultPreview">Default preview</Form.Label>
                  <div className="flex flex-col gap-2">
                    {previews.configs.map((preview, key) => {
                      if (preview.type === "iiif-preview-service") {
                        return null;
                      }
                      return (
                        <Form.InputContainer key={preview.id} horizontal>
                          <Form.Input
                            type="radio"
                            id={preview.id}
                            name="defaultPreview"
                            value={preview.id}
                            defaultChecked={!config.defaultPreview ? key === 0 : config.defaultPreview === preview.id}
                          />
                          <label htmlFor={preview.id}>{preview.label}</label>
                        </Form.InputContainer>
                      );
                    })}
                  </div>
                </Form.InputContainer>
              </SettingsSection>
            ) : null}

            {section === "editor" ? (
              <SettingsSection title="Editor">
                <Checkbox
                  name="rememberCanvasId"
                  label="Remember canvas ID"
                  checked={config.editorFeatureFlags?.rememberCanvasId || false}
                />
                <Checkbox
                  name="rememberLeftPanelId"
                  label="Remember left panel"
                  checked={config.editorFeatureFlags?.rememberLeftPanelId || false}
                />
                <Checkbox
                  name="manifestGridOptions"
                  label="Manifest grid options"
                  checked={config.editorFeatureFlags?.manifestGridOptions || false}
                />
              </SettingsSection>
            ) : null}

            {section === "export" ? (
              <SettingsSection title="Export">
                <Checkbox
                  name="isVersion2"
                  label={`Export Presentation 2 ${resource.type}s`}
                  checked={config.export?.version === 2}
                />
                {resource.type === "Manifest" ? (
                  <a
                    className="text-sm text-me-primary-500 hover:text-me-primary-600 hover:underline"
                    href={
                      window.location.pathname.includes("/exhibition")
                        ? window.location.pathname.replace("/exhibition", "") || "/"
                        : `${window.location.pathname}/exhibition`
                    }
                  >
                    {window.location.pathname.includes("/exhibition")
                      ? "Return to Manifest Editor"
                      : "Go to Exhibition Editor"}
                  </a>
                ) : null}
              </SettingsSection>
            ) : null}

            <div className="border-t border-gray-100 pt-4">
              <ActionButton type="submit">Save changes</ActionButton>
            </div>
          </Form.Form>
        )}
      </main>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Checkbox({ name, label, checked }: { name: string; label: string; checked: boolean }) {
  return (
    <Form.InputContainer horizontal className="my-1">
      <Form.Input type="checkbox" name={name} id={name} defaultChecked={checked} />
      <Form.Label htmlFor={name}>{label}</Form.Label>
    </Form.InputContainer>
  );
}
