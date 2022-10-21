export function parseServiceProfile(_profile: string | any[]) {
  let profile = typeof _profile === "string" ? _profile : _profile.find((r) => typeof r === "string");

  if (!profile) {
    return "";
  }

  if (profile.startsWith("http://iiif.io/api/image/2/")) {
    profile = profile.slice("http://iiif.io/api/image/2/".length);
  }
  if (profile.startsWith("http://iiif.io/api/image/3/")) {
    profile = profile.slice("http://iiif.io/api/image/3/".length);
  }

  if (profile.endsWith(".json")) {
    profile = profile.slice(0, -1 * ".json".length);
  }

  return profile;
}
