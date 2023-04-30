import { internalGetApps } from "@/apps/app-loader";

const state = internalGetApps(import.meta.globEager("./**/index.ts*"));

export function getApps() {
  return state;
}
