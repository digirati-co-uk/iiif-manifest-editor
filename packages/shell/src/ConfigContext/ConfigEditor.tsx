import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { ActionButton, Form, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { useDecayState } from "../hooks/use-decay-state";
import { PluginManager } from "../PluginContext/PluginManager";
import { usePreviewContext, usePreviews } from "../PreviewContext/PreviewContext";
import { type Config, useConfig, useSaveConfig } from "./ConfigContext";
import { IIIFOptions } from "./IIIFOptions";

export function ConfigEditor() {
  const { resolveMessage } = useEditorI18n();

  const t = useTranslations("shell");

  const previews = usePreviewContext();
  const resource = useAppResource();
  const config = useConfig();
  const setConfig = useSaveConfig();
  const [isSaved, saveState] = useDecayState(2000);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formValues = new FormData(e.target as HTMLFormElement);

    const newConfig: Partial<Config> = {
      defaultPreview: formValues.get("defaultPreview") as string,
      i18n: {
        ...(config.i18n || ({} as any)),
        advancedLanguageMode: formValues.get("advancedLanguageMode") === "on",
        availableLanguages: ((formValues.get("availableLanguages") as string) || "")
          .split(",")
          .map((t: string) => t.trim()),
        defaultLanguage: formValues.get("defaultLanguage") as string,
      },
      export: {
        ...(config.export || ({} as any)),
        version: formValues.get("isVersion2") === "on" ? 2 : 3,
        baseIdentifier: (formValues.get("base") as string) || null,
      },
      plugins: config.plugins,
      editorFeatureFlags: {
        ...(config.editorFeatureFlags || ({} as any)),
        rememberCanvasId: formValues.get("rememberCanvasId") === "on",
        rememberLeftPanelId: formValues.get("rememberLeftPanelId") === "on",
        annotationPopups: formValues.get("annotationPopups") === "on",
        manifestGridOptions: formValues.get("manifestGridOptions") === "on",
        enableMultiImageCanvases: formValues.get("enableMultiImageCanvases") === "on",
        enableMultiMediaCanvases: formValues.get("enableMultiMediaCanvases") === "on",
      },
    };

    setConfig(newConfig);
    saveState.set();
    saveState.clear();
  }

  return (
    <Sidebar>
      <SidebarHeader title={t("settings.title")} />
      {isSaved ? <div className="bg-me-primary-500 text-white p-3 text-sm">{t("settings.saved")}</div> : null}
      <SidebarContent className="p-4">
        <IIIFOptions />
        <Form.Form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Form.InputContainer>
            <Form.Label htmlFor="defaultLanguage">{t("settings.contentDefault")}</Form.Label>
            <Form.Input
              type="text"
              name="defaultLanguage"
              id="defaultLanguage"
              defaultValue={config.i18n?.defaultLanguage || ""}
            />
          </Form.InputContainer>

          <Form.InputContainer>
            <Form.Label htmlFor="availableLanguages">{t("settings.contentAvailable")}</Form.Label>
            <Form.Input
              type="text"
              name="availableLanguages"
              id="availableLanguages"
              defaultValue={(config.i18n?.availableLanguages || []).join(", ")}
            />
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="advancedLanguageMode"
              id="advancedLanguageMode"
              defaultChecked={config.i18n?.advancedLanguageMode || false}
            />
            <Form.Label htmlFor="advancedLanguageMode">{t("settings.contentAdvanced")}</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="textGranularityEnabled"
              id="textGranularityEnabled"
              defaultChecked={config.i18n?.textGranularityEnabled || false}
            />
            <Form.Label htmlFor="textGranularityEnabled">{t("settings.textGranularity")}</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="rememberCanvasId"
              id="rememberCanvasId"
              defaultChecked={config.editorFeatureFlags?.rememberCanvasId || false}
            />
            <Form.Label htmlFor="rememberCanvasId">{t("settings.rememberCanvas")}</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="rememberLeftPanelId"
              id="rememberLeftPanelId"
              defaultChecked={config.editorFeatureFlags?.rememberLeftPanelId || false}
            />
            <Form.Label htmlFor="rememberLeftPanelId">{t("settings.rememberPanel")}</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="manifestGridOptions"
              id="manifestGridOptions"
              defaultChecked={config.editorFeatureFlags?.manifestGridOptions || false}
            />
            <Form.Label htmlFor="manifestGridOptions">{t("settings.grid")}</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="isVersion2"
              id="isVersion2"
              defaultChecked={config.export?.version === 2}
            />
            <Form.Label htmlFor="isVersion2">
              {t(resource.type === "Collection" ? "settings.exportCollections" : "settings.exportManifests")}
            </Form.Label>
          </Form.InputContainer>

          {/* <Form.InputContainer>
            <Form.Label htmlFor="base">Base Identifier</Form.Label>
            <Form.Input
              type="text"
              name="base"
              id="base"
              autoComplete="none"
              defaultValue={config.export?.baseIdentifier || ""}
            />
          </Form.InputContainer> */}

          <Form.InputContainer>
            <Form.Label htmlFor="defaultPreview">{t("settings.defaultPreview")}</Form.Label>
            <div>
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
                    <label htmlFor={preview.id}>{resolveMessage(preview?.labelMessage, preview.label)}</label>
                  </Form.InputContainer>
                );
              })}
            </div>
          </Form.InputContainer>
          {resource.type === "Manifest" ? (
            <a
              className="text-sm text-me-primary-500 hover:underline hover:text-me-primary-600"
              href={
                window.location.pathname.includes("/exhibition")
                  ? window.location.pathname.replace("/exhibition", "") || "/"
                  : `${window.location.pathname}/exhibition`
              }
            >
              {window.location.pathname.includes("/exhibition") ? t("settings.return") : t("settings.exhibition")}
            </a>
          ) : null}

          <PluginManager />

          <div className="mt-5">
            <ActionButton type="submit">{t("actions.save")}</ActionButton>
          </div>
        </Form.Form>
      </SidebarContent>
    </Sidebar>
  );
}
