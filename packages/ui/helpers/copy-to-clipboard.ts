import { man } from "ionicons/icons";

export async function copyToClipboard(json: string | any) {
  return navigator.clipboard.writeText(typeof json === "string" ? json : JSON.stringify(json, null, 2));
}
