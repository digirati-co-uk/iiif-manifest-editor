import { ActionButton, Form, Sidebar, SidebarContent, SidebarHeader } from "@manifest-editor/components";
import { useAppResource } from "../AppResourceProvider/AppResourceProvider";
import { usePreviewContext, usePreviews } from "../PreviewContext/PreviewContext";
import { useDecayState } from "../hooks/use-decay-state";
import { type Config, useConfig, useSaveConfig } from "./ConfigContext";

export function ConfigEditor() {
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
      editorFeatureFlags: {
        ...(config.editorFeatureFlags || ({} as any)),
        rememberCanvasId: formValues.get("rememberCanvasId") === "on",
      },
    };

    setConfig(newConfig);
    saveState.set();
    saveState.clear();
  }

  return (
    <Sidebar>
      <SidebarHeader title="Workspace configuration" />
      {isSaved ? <div className="bg-me-primary-500 text-white p-3 text-sm">Changes saved</div> : null}
      <SidebarContent className="p-4">
        <Form.Form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Form.InputContainer>
            <Form.Label htmlFor="defaultLanguage">Default Language</Form.Label>
            <Form.Input
              type="text"
              name="defaultLanguage"
              id="defaultLanguage"
              defaultValue={config.i18n?.defaultLanguage || ""}
            />
          </Form.InputContainer>

          <Form.InputContainer>
            <Form.Label htmlFor="availableLanguages">Available Languages</Form.Label>
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
            <Form.Label htmlFor="advancedLanguageMode">Advanced Language Mode</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="textGranularityEnabled"
              id="textGranularityEnabled"
              defaultChecked={config.i18n?.textGranularityEnabled || false}
            />
            <Form.Label htmlFor="textGranularityEnabled">Enable text granularity</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="rememberCanvasId"
              id="rememberCanvasId"
              defaultChecked={config.editorFeatureFlags?.rememberCanvasId || false}
            />
            <Form.Label htmlFor="rememberCanvasId">Remember Canvas ID</Form.Label>
          </Form.InputContainer>

          <Form.InputContainer horizontal className="my-3">
            <Form.Input
              type="checkbox"
              name="isVersion2"
              id="isVersion2"
              defaultChecked={config.export?.version === 2}
            />
            <Form.Label htmlFor="isVersion2">Export Presentation 2 {resource.type}s</Form.Label>
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
            <Form.Label htmlFor="defaultPreview">Default preview</Form.Label>
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
                    <label htmlFor={preview.id}>{preview.label}</label>
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
              {window.location.pathname.includes("/exhibition")
                ? "Return to Manifest Editor"
                : "Go to Exhibition Editor"}
            </a>
          ) : null}

          <div className="mt-5">
            <ActionButton type="submit">{"Save changes"}</ActionButton>
          </div>
        </Form.Form>
      </SidebarContent>
    </Sidebar>
  );
}
