import { LayoutProps } from "../shell/Layout/Layout.types";

type LoadedApp = Partial<LayoutProps> & {
  default: {
    id: string;
    title: string;
    type?: "manifest" | "launcher";
    project?: boolean;
    projectType?: "Manifest" | "Collection";
    dev?: boolean;
    desktop?: boolean;
    web?: boolean;
    drafts?: boolean;
  };
};

export type MappedApp = {
  metadata: LoadedApp["default"];
  layout: LayoutProps;
};

const state = internalGetApps(import.meta.globEager("./**/index.ts*"));

export function getApps() {
  return state;
}

export type AppDefinition = {
  allApps: Record<string, MappedApp>;
  allAppIds: string[];
  allPaths: string[];
};

export function internalGetApps(appMap: Record<string, LoadedApp>): AppDefinition {
  const allApps: Record<string, MappedApp> = {};
  const allAppIds: string[] = [];
  const allPaths: string[] = [];

  for (const path of Object.keys(appMap)) {
    const { default: metadata, ...props }: LoadedApp = appMap[path] as any;

    if (window.__TAURI__ && metadata.web) {
      continue;
    }

    if (!window.__TAURI__ && metadata.desktop) {
      continue;
    }

    allPaths.push(path);

    if (!metadata || !metadata.id) {
      continue;
    }

    allAppIds.push(metadata.id);
    allApps[metadata.id] = {
      metadata: metadata as any,
      layout: {
        leftPanels: [],
        rightPanels: [],
        centerPanels: [],
        ...props,
      },
    };
  }

  return { allApps, allAppIds, allPaths };
}
