import { describe, expect, it } from "vitest";
import { resolveRelease, validateCatalog, type ReleaseCatalog, type RemoteRelease } from "./releases";

const host = { runtimeApiVersion: 1, reactMajor: 19 };
const release = (version: string, overrides: Partial<RemoteRelease> = {}): RemoteRelease => ({
  version,
  buildId: "a".repeat(32),
  ...host,
  script: { url: `/remote-editor/assets/${"a".repeat(32)}/runtime.js`, integrity: `sha384-${"A".repeat(64)}` },
  stylesheet: { url: `/remote-editor/assets/${"a".repeat(32)}/runtime.css`, integrity: `sha384-${"A".repeat(64)}` },
  ...overrides,
});
const catalog: ReleaseCatalog = {
  releases: [release("2.2.0"), release("2.2.9"), release("2.2.10"), release("2.2.11-next.1"), release("2.3.0")],
  latest: "2.3.0",
};

describe("remote release resolution", () => {
  it("pins exact releases and allows explicit prereleases", () => {
    expect(resolveRelease(catalog, "2.2.0", host).version).toBe("2.2.0");
    expect(resolveRelease(catalog, "2.2.11-next.1", host).version).toBe("2.2.11-next.1");
  });
  it("selects patches numerically within one minor and excludes prereleases", () => {
    expect(resolveRelease(catalog, "2.2.x", host).version).toBe("2.2.10");
  });
  it("uses the promoted latest, not the largest package version", () => {
    expect(resolveRelease({ ...catalog, latest: "2.2.9" }, "latest", host).version).toBe("2.2.9");
  });
  it("does not silently fall back from incompatible releases", () => {
    expect(() => resolveRelease(catalog, "latest", { ...host, reactMajor: 18 })).toThrow("requires");
    expect(() => resolveRelease(catalog, "latest", { ...host, runtimeApiVersion: 2 })).toThrow("requires");
  });
  it.each(["^2.2.0", "2", "2.2", "02.2.0", "2.2.0-next.01", "https://evil.example/runtime.js", "latest/../x"])(
    "rejects invalid selection %s",
    (selection) => {
      expect(() => resolveRelease(catalog, selection, host)).toThrow("Choose");
    }
  );
  it("rejects unavailable releases rather than picking a different version", () => {
    expect(() => resolveRelease(catalog, "2.1.x", host)).toThrow("No approved");
    expect(() => resolveRelease({ releases: [], latest: null }, "latest", host)).toThrow("No approved");
  });
  it("rejects duplicate releases, invalid latest and malformed hashes", () => {
    expect(() => validateCatalog({ releases: [release("2.2.0"), release("2.2.0")], latest: null })).toThrow(
      "duplicate"
    );
    expect(() => validateCatalog({ ...catalog, latest: "2.2.11-next.1" })).toThrow("stable");
    expect(() =>
      validateCatalog({
        releases: [release("2.2.0", { script: { url: catalog.releases[0]!.script.url, integrity: "" } })],
        latest: null,
      })
    ).toThrow("asset");
  });
  it.each([
    "https://evil.example/runtime.js",
    "//evil.example/runtime.js",
    "/remote-editor/assets/../../evil.js",
    "https://cdn.jsdelivr.net/npm/manifest-editor@latest/dist/browser/runtime.js",
    "https://cdn.jsdelivr.net/npm/manifest-editor@2.2.0/dist/browser/../evil.js",
  ])("rejects unapproved asset URL %s", (url) => {
    expect(() =>
      validateCatalog({
        releases: [release("2.2.0", { script: { ...catalog.releases[0]!.script, url } })],
        latest: null,
      })
    ).toThrow("origin or path");
  });
  it("accepts the exact published jsDelivr asset", () => {
    const item = release("2.2.0");
    item.script.url = "https://cdn.jsdelivr.net/npm/manifest-editor@2.2.0/dist/browser/runtime.js";
    item.stylesheet.url = "https://cdn.jsdelivr.net/npm/manifest-editor@2.2.0/dist/browser/runtime.css";
    expect(() => validateCatalog({ releases: [item], latest: null })).not.toThrow();
  });
});
