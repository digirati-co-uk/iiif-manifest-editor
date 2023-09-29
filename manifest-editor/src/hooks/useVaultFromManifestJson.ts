import { useEffect, useState } from "react";
import { Vault } from "@iiif/vault";
import { Collection, Manifest } from "@iiif/presentation-3";

export function useVaultFromManifestJson(data: undefined | null | string) {
  const [ref, setRef] = useState<{ id: string; type: string }>();
  const [parsed, setParsed] = useState<Manifest | Collection>();
  const [vault, setVault] = useState<Vault>();

  useEffect(() => {
    if (data) {
      const parsed: any = JSON.parse(data);
      const _vault = new Vault();
      setParsed(JSON.parse(data)); // Second copy.
      _vault.load(parsed["@id"] || parsed.id, parsed).then((manifest: any) => {
        setVault(_vault);
        setRef({ id: manifest.id as string, type: manifest.type });
      });
    }
  }, [data]);

  return [ref, vault, parsed] as const;
}
