import { getValue } from "@iiif/helpers";
import type { InternationalString } from "@iiif/presentation-3";
import { ActionButton, PaddedSidebarContainer } from "@manifest-editor/components";
import type { CreatorContext, CreatorFunctionContext } from "@manifest-editor/creator-api";
import { Input, InputContainer, InputLabel, LanguageFieldEditor } from "@manifest-editor/editors";
import { useState } from "react";

export interface CreateProviderPayload {
  url: string;
  label: InternationalString;
  homepage?: string;
  homepageLabel?: InternationalString;
  logo?: string;
}

export async function createProvider(data: CreateProviderPayload, ctx: CreatorFunctionContext) {
  const provider = {
    id: data.url || ctx.generateId("provider"),
    label: data.label,
    type: "Agent",
    homepage: [] as any[],
    logo: [] as any[],
  };

  if (data.homepage) {
    provider.homepage = [
      ctx.embed({
        id: data.url,
        label: getValue(data.homepageLabel) ? data.homepageLabel : { en: ["Homepage"] },
        type: "Text",
        format: "text/html",
        language: ["en"],
      }),
    ];
  }

  if (data.logo) {
    provider.logo = [
      ctx.embed({
        id: data.logo,
        type: "Image",
      }),
    ];
  }

  return ctx.embed(provider);
}

export function CreateProviderForm(props: CreatorContext<CreateProviderPayload>) {
  const initialData = props.options.initialData as Partial<CreateProviderPayload>;
  const [url, setUrl] = useState(initialData.url || "");
  const [label, setLabel] = useState(initialData.label || ({ en: [""] } as InternationalString));
  const [homepage, setHomepage] = useState(initialData.homepage || "");
  const [logo, setLogo] = useState(initialData.logo || "");
  const [homepageLabel, setHomepageLabel] = useState(
    initialData.homepageLabel || ({ en: [""] } as InternationalString),
  );

  const onSubmit = () => {
    props.runCreate({
      url,
      label,
      homepage,
      homepageLabel,
      logo,
    });
  };

  return (
    <PaddedSidebarContainer>
      <div className="max-w-xl">
        <LanguageFieldEditor
          containerId={"label"}
          focusId={"label_"}
          label={"Label"}
          fields={label}
          onSave={(e: any) => setLabel(e.toInternationalString())}
        />

        <InputContainer $fluid>
          <InputLabel htmlFor="provider-logo">Logo</InputLabel>
          <Input
            placeholder="https://example.org/logo.png"
            type="text"
            id="provider-logo"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
          />
        </InputContainer>

        <InputContainer $fluid>
          <InputLabel htmlFor="provider-homepage">Homepage</InputLabel>
          <Input
            placeholder="https://example.org/homepage"
            type="text"
            id="provider-homepage"
            value={homepage}
            onChange={(e) => setHomepage(e.target.value)}
          />
        </InputContainer>

        {homepage ? (
          <div>
            <LanguageFieldEditor
              placeholder="Homepage"
              containerId={"homepageLabel"}
              focusId={"homepageLabel_"}
              label={"Homepage label"}
              fields={homepageLabel}
              onSave={(e: any) => setHomepageLabel(e.toInternationalString())}
            />
          </div>
        ) : null}

        <InputContainer $fluid>
          <InputLabel $margin={false} htmlFor="provider-url">
            Custom Identifier
          </InputLabel>
          <span className="text-gray-500 text-sm mb-2">Will be generated if not specified</span>
          <Input
            placeholder="https://id.loc.gov/authorities/abc123"
            type="text"
            id="provider-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </InputContainer>

        <ActionButton primary large type="button" onPress={onSubmit} isDisabled={!url}>
          Add provider
        </ActionButton>
      </div>
    </PaddedSidebarContainer>
  );
}
