import { Form } from "@manifest-editor/components";
import type { FormEvent } from "react";
import { useConfig, useSaveConfig } from "./ConfigContext";

export function IIIFOptions() {
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
      <h2 className="text-xl font-semibold text-gray-900">IIIF Options</h2>
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-3 text-base font-semibold">Image services</legend>
        <Form.InputContainer>
          <Form.Label htmlFor="compactImageServices">Compact services</Form.Label>
          <select
            id="compactImageServices"
            name="compact"
            className="rounded border border-gray-300 p-2"
            defaultValue={settings.compact === "compact" ? "compact" : "with-dimensions"}
          >
            <option value="with-dimensions">id, type, profile, width, height (default)</option>
            <option value="compact">id, type, profile (compact)</option>
          </select>
        </Form.InputContainer>
        <Form.InputContainer horizontal>
          <Form.Input
            id="includeSizes"
            name="includeSizes"
            type="checkbox"
            defaultChecked={settings.includeSizes === true}
          />
          <Form.Label htmlFor="includeSizes">Include sizes</Form.Label>
        </Form.InputContainer>
        <Form.InputContainer horizontal>
          <Form.Input
            id="includeTiles"
            name="includeTiles"
            type="checkbox"
            defaultChecked={settings.includeTiles === true}
          />
          <Form.Label htmlFor="includeTiles">Include tiles</Form.Label>
        </Form.InputContainer>
        <p className="text-sm text-gray-500">
          Applies to newly added images. Thumbnails always include available sizes and tiles.
        </p>
      </fieldset>
    </Form.Form>
  );
}
