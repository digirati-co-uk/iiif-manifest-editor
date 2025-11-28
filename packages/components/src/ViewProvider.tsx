import { getValue } from "@iiif/helpers";
import { Button } from "react-aria-components";
import { LocaleString, useVault, useVaultSelector } from "react-iiif-vault";
import { ProviderImage } from "./ProviderImage";
import { ProviderLink } from "./ProviderLink";

export function ViewProvider({ resource, onPress }: { resource: { id: string; type: string }; onPress?: () => void }) {
  const provider = useVaultSelector((_, v) => v.get(resource));

  if (!provider) return null;

  const isUnknown = getValue(provider.label) === "Unknown";
  return (
    <Button
      className="rounded p-2 border border-gray-200 text-center hover:border-me-500 shadow-sm"
      key={provider.id}
      onPress={onPress}
    >
      {provider.logo?.length > 0 ? (
        <div>
          {provider.logo.map((logo: any, n: number) => (
            <ProviderImage key={n} item={logo} />
          ))}
        </div>
      ) : null}

      {!isUnknown && (
        <div className="px-2 font-semibold mb-5">
          <LocaleString enableDangerouslySetInnerHTML separator="<br>">
            {provider?.label}
          </LocaleString>
        </div>
      )}

      {provider.homepage?.length > 0 ? (
        <div>
          {provider.homepage.map((homepage: any, n: number) => (
            <ProviderLink key={n} className="justify-center" item={homepage} />
          ))}
        </div>
      ) : null}

      {provider.seeAlso?.length > 0 ? (
        <div>
          {provider.seeAlso?.map((seeAlso: any, n: number) => (
            <ProviderLink className="justify-center" key={n} item={seeAlso} />
          ))}
        </div>
      ) : null}
    </Button>
  );
}
