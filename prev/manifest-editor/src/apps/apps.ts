import { internalGetApps } from "@/apps/app-loader";

const state = internalGetApps(import.meta.glob("./**/index.ts*", { eager: true }));

export function getApps() {
  return state;
}
