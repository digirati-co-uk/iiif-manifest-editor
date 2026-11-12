import { describe, expect, test } from "vitest";
import { importManifestMetadata } from "./manifest-metadata";

const title = { label: { en: ["Title"], cy: ["Teitl"] }, value: { en: ["A painting"] } };
const restrictions = { label: { en: ["Restrictions on use"] }, value: { en: ["Credit the library"] } };
const manifest = { metadata: [title, restrictions] };

describe("Manifest metadata import", () => {
  test("imports all by default and keeps the source untouched", () => {
    expect(importManifestMetadata(manifest, {}).metadata).toEqual(manifest.metadata);
    expect(importManifestMetadata(manifest, {}).metadata).not.toBe(manifest.metadata);
  });

  test("matches any language label exactly and ignores case and surrounding whitespace", () => {
    expect(importManifestMetadata(manifest, { manifestMetadataLabels: [" TEITL "] }).metadata).toEqual([title]);
    expect(importManifestMetadata(manifest, { manifestMetadataLabels: ["tit"] }).metadata).toEqual([]);
    expect(importManifestMetadata(manifest, { manifestMetadataLabels: [] }).metadata).toEqual([]);
  });

  test("extracts a required statement independently of the metadata allowlist", () => {
    const result = importManifestMetadata(manifest, {
      manifestMetadataLabels: ["Title"],
      requiredStatementMetadataLabels: ["restrictions on use"],
    });
    expect(result).toEqual({ metadata: [title], requiredStatement: restrictions });
    expect(manifest.metadata).toEqual([title, restrictions]);
  });

  test("does not overwrite an existing required statement or discard the matching metadata", () => {
    const statement = { label: { none: ["Credit"] }, value: { none: ["Existing credit"] } };
    expect(
      importManifestMetadata(
        { ...manifest, requiredStatement: statement },
        {
          requiredStatementMetadataLabels: ["Restrictions on use"],
        }
      )
    ).toEqual({ metadata: manifest.metadata, requiredStatement: statement });
  });

  test("uses the first match and can fill an empty normalized required statement", () => {
    expect(
      importManifestMetadata(
        { ...manifest, requiredStatement: { label: { none: [] }, value: { none: [] } } },
        {
          requiredStatementMetadataLabels: ["Title", "Restrictions on use"],
        }
      )
    ).toEqual({ metadata: [restrictions], requiredStatement: title });
  });
});
