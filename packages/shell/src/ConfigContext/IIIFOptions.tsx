import { useTranslations } from "@manifest-editor/i18n";
import { Form } from "@manifest-editor/components";
import type { FormEvent } from "react";
import { useConfig, useSaveConfig } from "./ConfigContext";

export function IIIFOptions() {
  const t = useTranslations("shell");

  const config = useConfig();
  const saveConfig = useSaveConfig();
  const settings = config.creators["iiif-image-services"] || {};

  return (
    <Form.Form
      className="flex max-w-3xl flex-col gap-4"
      onChange={(event: FormEvent<HTMLFormElement>) => {
        const values = new FormData(event.currentTarget);
        saveConfig({
          creators: {
            "iiif-image-services": {
              compact: values.get("compact") === "compact" ? "compact" : "with-dimensions",
              includeSizes: values.get("includeSizes") === "on",
              includeTiles: values.get("includeTiles") === "on",
            },
          },
        });
      }}
      onSubmit={(event: FormEvent<HTMLFormElement>) => event.preventDefault()}
    >
      <h2 className="text-xl font-semibold text-gray-900">{t("settings.iiif")}</h2>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-base font-semibold">{t("settings.imageServices")}</legend>
        <Form.InputContainer>
          <Form.Label htmlFor="compactImageServices">{t("settings.compact")}</Form.Label>
          <select
            id="compactImageServices"
            name="compact"
            className="rounded border border-gray-300 p-2"
            defaultValue={settings.compact === "compact" ? "compact" : "with-dimensions"}
          >
            <option value="with-dimensions">{t("settings.dimensions")}</option>
            <option value="compact">{t("settings.minimal")}</option>
          </select>
        </Form.InputContainer>
        <Form.InputContainer horizontal>
          <Form.Input
            id="includeSizes"
            name="includeSizes"
            type="checkbox"
            defaultChecked={settings.includeSizes === true}
          />
          <Form.Label htmlFor="includeSizes">{t("settings.sizes")}</Form.Label>
        </Form.InputContainer>
        <Form.InputContainer horizontal>
          <Form.Input
            id="includeTiles"
            name="includeTiles"
            type="checkbox"
            defaultChecked={settings.includeTiles === true}
          />
          <Form.Label htmlFor="includeTiles">{t("settings.tiles")}</Form.Label>
        </Form.InputContainer>
        <p className="text-sm text-gray-500">{t("settings.imageHelp")}</p>
      </fieldset>
    </Form.Form>
  );
}
