export interface RemoteRelease {
  version: string;
  buildId: string;
  runtimeApiVersion: number;
  reactMajor: number;
  script: { url: string; integrity: string };
  stylesheet: { url: string; integrity: string };
}

export interface ReleaseCatalog {
  releases: RemoteRelease[];
  latest: string | null;
}

// Deliberately supports exact versions, a minor line, and latest, rather than arbitrary npm ranges.
const stable = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const exact =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?$/;
const minor = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.x$/;

export function isExactVersion(value: string) {
  return value.length < 100 && exact.test(value);
}

export function validateCatalog(value: unknown): asserts value is ReleaseCatalog {
  if (!value || typeof value !== "object") throw new Error("Invalid release catalog");
  const catalog = value as ReleaseCatalog;
  if (!Array.isArray(catalog.releases) || !(catalog.latest === null || typeof catalog.latest === "string")) {
    throw new Error("Invalid release catalog");
  }
  const versions = new Set<string>();
  for (const release of catalog.releases) {
    if (
      !release ||
      typeof release.version !== "string" ||
      !isExactVersion(release.version) ||
      typeof release.buildId !== "string" ||
      !/^[a-f0-9]{32}$/.test(release.buildId) ||
      !Number.isInteger(release.runtimeApiVersion) ||
      release.runtimeApiVersion < 1 ||
      !Number.isInteger(release.reactMajor) ||
      release.reactMajor < 1 ||
      versions.has(release.version)
    ) {
      throw new Error("Invalid or duplicate release");
    }
    for (const [asset, filename] of [
      [release.script, "runtime.js"],
      [release.stylesheet, "runtime.css"],
    ] as const) {
      if (
        !asset ||
        typeof asset.url !== "string" ||
        typeof asset.integrity !== "string" ||
        !/^sha384-[A-Za-z0-9+/]{64}$/.test(asset.integrity)
      )
        throw new Error("Invalid release asset");
      if (
        asset.url !== `/remote-editor/assets/${release.buildId}/${filename}` &&
        asset.url !== `https://cdn.jsdelivr.net/npm/manifest-editor@${release.version}/dist/browser/${filename}`
      ) {
        throw new Error("Release asset origin or path is not allowed");
      }
    }
    versions.add(release.version);
  }
  if (catalog.latest !== null && (!stable.test(catalog.latest) || !versions.has(catalog.latest))) {
    throw new Error("Latest must reference a catalogued stable release");
  }
}

export function resolveRelease(
  catalog: ReleaseCatalog,
  selection: string,
  host: { runtimeApiVersion: number; reactMajor: number }
) {
  validateCatalog(catalog);
  if (
    typeof selection !== "string" ||
    selection.length > 100 ||
    !(selection === "latest" || minor.test(selection) || isExactVersion(selection))
  ) {
    throw new Error("Choose an exact version, a minor line such as 2.2.x, or latest");
  }
  let release: RemoteRelease | undefined;
  if (minor.test(selection)) {
    const prefix = selection.slice(0, -1);
    release = catalog.releases
      .filter((item) => stable.test(item.version) && item.version.startsWith(prefix))
      .sort((a, b) => Number(b.version.split(".")[2]) - Number(a.version.split(".")[2]))[0];
  } else {
    release = catalog.releases.find((item) => item.version === (selection === "latest" ? catalog.latest : selection));
  }
  if (!release) throw new Error(`No approved browser runtime for ${selection}`);
  if (host.runtimeApiVersion !== release.runtimeApiVersion || host.reactMajor !== release.reactMajor) {
    throw new Error(
      `Release ${release.version} requires runtime API ${release.runtimeApiVersion} and React ${release.reactMajor}`
    );
  }
  return release;
}
