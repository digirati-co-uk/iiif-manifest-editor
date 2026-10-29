"use client";

import { useTranslations, useEditorI18n } from "@manifest-editor/i18n";

import { Form } from "@manifest-editor/components";
import {
  type Config,
  CreatorSettings,
  IIIFOptions,
  PluginManager,
  useAppResource,
  useConfig,
  usePreviewContext,
  useSaveConfig,
} from "@manifest-editor/shell";
import { useState } from "react";

type SettingsSection = "general" | "preview" | "editor" | "export" | "iiif" | "creators" | "plugins";

const sections: Array<{ id: SettingsSection; label: string }> = [
  { id: "general", label: "settings.general" },
  { id: "preview", label: "settings.preview" },
  { id: "editor", label: "settings.editor" },
  { id: "export", label: "settings.export" },
  { id: "iiif", label: "settings.iiif" },
  { id: "creators", label: "settings.creators" },
  { id: "plugins", label: "settings.plugins" },
];

export function BrowserSettingsPanel() {
  const webT = useTranslations("web");
  const i18n = useEditorI18n();

  const previews = usePreviewContext();
  const resource = useAppResource();
  const config = useConfig();
  const setConfig = useSaveConfig();
  const [section, setSection] = useState<SettingsSection>("general");

  function saveSection(form: HTMLFormElement) {
    const formValues = new FormData(form);
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
  }

  return (
    <div className="flex h-[70vh] min-h-[60vh] w-full flex-col overflow-hidden border-t border-gray-100 bg-white sm:!flex-row">
      <nav
        className="w-full flex-none border-b border-gray-200 bg-gray-50 p-3 sm:!w-52 sm:!border-r sm:!border-b-0"
        aria-label={webT("settings.sections")}
      >
        <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
          {webT("settings.title")}
        </div>
        <div className="flex gap-1 overflow-x-auto sm:!flex-col">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={section === item.id ? "page" : undefined}
              className={[
                "whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                section === item.id ? "bg-white text-me-primary-600 shadow-sm" : "text-gray-600 hover:bg-white",
              ].join(" ")}
              onClick={() => setSection(item.id)}
            >
              {webT(item.label)}
            </button>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:!p-6">
        {section === "plugins" ? (
          <SettingsSection title={webT("settings.plugins")}>
            <PluginManager />
          </SettingsSection>
        ) : section === "iiif" ? (
          <IIIFOptions />
        ) : section === "creators" ? (
          <SettingsSection title={webT("settings.creators")}>
            <CreatorSettings />
          </SettingsSection>
        ) : (
          <Form.Form
            onChange={(e: React.FormEvent<HTMLFormElement>) => saveSection(e.currentTarget)}
            className="flex max-w-3xl flex-col gap-6"
          >
            {section === "general" ? (
              <SettingsSection title={webT("settings.general")}>
                <Form.InputContainer>
                  <Form.Label htmlFor="defaultLanguage">{webT("settings.defaultContentLanguage")}</Form.Label>
                  <Form.Input
                    type="text"
                    name="defaultLanguage"
                    id="defaultLanguage"
                    defaultValue={config.i18n?.defaultLanguage || ""}
                  />
                </Form.InputContainer>

                <Form.InputContainer>
                  <Form.Label htmlFor="availableLanguages">{webT("settings.contentLanguages")}</Form.Label>
                  <Form.Input
                    type="text"
                    name="availableLanguages"
                    id="availableLanguages"
                    defaultValue={(config.i18n?.availableLanguages || []).join(", ")}
                  />
                </Form.InputContainer>

                <Checkbox
                  name="advancedLanguageMode"
                  label={webT("settings.advancedLanguage")}
                  checked={config.i18n?.advancedLanguageMode || false}
                />
                <Checkbox
                  name="textGranularityEnabled"
                  label={webT("settings.granularity")}
                  checked={config.i18n?.textGranularityEnabled || false}
                />
              </SettingsSection>
            ) : null}

            {section === "preview" ? (
              <SettingsSection title={webT("actions.preview")}>
                <Form.InputContainer>
                  <Form.Label htmlFor="defaultPreview">{webT("settings.defaultPreview")}</Form.Label>
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
                          <label htmlFor={preview.id}>{i18n.resolveMessage(preview.labelMessage, preview.label)}</label>
                        </Form.InputContainer>
                      );
                    })}
                  </div>
                </Form.InputContainer>
              </SettingsSection>
            ) : null}

            {section === "editor" ? (
              <SettingsSection title={webT("settings.editor")}>
                <Checkbox
                  name="rememberCanvasId"
                  label={webT("settings.rememberCanvas")}
                  checked={config.editorFeatureFlags?.rememberCanvasId || false}
                />
                <Checkbox
                  name="rememberLeftPanelId"
                  label={webT("settings.rememberPanel")}
                  checked={config.editorFeatureFlags?.rememberLeftPanelId || false}
                />
                <Checkbox
                  name="manifestGridOptions"
                  label={webT("settings.grid")}
                  checked={config.editorFeatureFlags?.manifestGridOptions || false}
                />
              </SettingsSection>
            ) : null}

            {section === "export" ? (
              <SettingsSection title={webT("settings.export")}>
                <Checkbox
                  name="isVersion2"
                  label={webT(resource.type === "Manifest" ? "settings.exportManifests" : "settings.exportCollections")}
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
                      ? webT("settings.returnManifest")
                      : webT("settings.goExhibition")}
                  </a>
                ) : null}
              </SettingsSection>
            ) : null}
          </Form.Form>
        )}
      </div>
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
