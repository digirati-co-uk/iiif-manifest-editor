import { Button } from "@manifest-editor/ui/atoms/Button";
import { Config, useConfig, useSaveConfig } from "./ConfigContext";
import { Sidebar, SidebarHeader, SidebarContent, Form, ActionButton } from "@manifest-editor/components";
import { useDecayState } from "../hooks/use-decay-state";

export function ConfigEditor() {
  const config = useConfig();
  const setConfig = useSaveConfig();
  const [isSaved, saveState] = useDecayState(2000);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formValues = new FormData(e.target as HTMLFormElement);

    const newConfig: Partial<Config> = {
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
              name="isVersion2"
              id="isVersion2"
              defaultChecked={config.export?.version === 2}
            />
            <Form.Label htmlFor="isVersion2">Export Presentation 2 Manifests</Form.Label>
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

          <div className="mt-5">
            <ActionButton type="submit">{"Save changes"}</ActionButton>
          </div>
        </Form.Form>
      </SidebarContent>
    </Sidebar>
  );
}
