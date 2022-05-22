import { LayoutProps } from "../shell/Layout/Layout.types";

type LoadedApp = Partial<LayoutProps> & {
  default: { title: string };
};

const state = internalGetApps(import.meta.globEager("./**/index.ts*"));

export function getApps() {
  return state;
}

function internalGetApps(appMap: Record<string, LoadedApp>) {
  const allApps: Record<string, LayoutProps> = {};
  const allAppNames: string[] = [];
  const allPaths: string[] = [];

  for (const path of Object.keys(appMap)) {
    const { default: details, ...props }: LoadedApp = appMap[path] as any;
    const name = details?.title;
    allPaths.push(path);
    if (!name) {
      continue;
    }

    allAppNames.push(name);
    allApps[name] = {
      leftPanels: [],
      rightPanels: [],
      centerPanels: [],
      ...props,
    };
  }

  return { allApps, allAppNames, allPaths };
}
