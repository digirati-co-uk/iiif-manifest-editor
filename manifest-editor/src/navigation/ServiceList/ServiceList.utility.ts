export function parseServiceProfile(profile: string) {
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
