import { createContext, ReactNode, useContext, useMemo } from "react";
import invariant from "tiny-invariant";
import { useOptionalLocalStorage } from "@manifest-editor/ui/madoc/use-local-storage";
import { AppProvider } from "./AppContext";

type MappedApp = any;

export type MultiAppContext = {
  apps: Record<string, MappedApp>;
  currentApp: { id: string; args?: any };
  initialApp: { id: string; args?: any };
  changeApp: (app: { id: string; args?: any }) => void;
  changeProjectType: (type: "Manifest" | "Collection") => void;
};

const MultiAppContext = createContext<MultiAppContext | null>(null);

export function useApps() {
  const ctx = useContext(MultiAppContext);

  invariant(ctx, "Hook useApps must be used inside <MultiAppProvider />");

  return ctx;
}

function useCurrentApp(initialApp?: { id: string; args?: any }, enableLocalStorage = false) {
  const [currentApp, changeApp] = useOptionalLocalStorage(
    "SelectedApplication",
    initialApp || { id: "splash" },
    !enableLocalStorage
  );

  return [currentApp, changeApp] as const;
}

export function MultiAppProvider({
  apps,
  initialApp,
  saveCurrentApp = true,
  instanceId,
  children,
  config = {},
}: {
  apps: Record<string, MappedApp>;
  initialApp?: MultiAppContext["currentApp"];
  saveCurrentApp?: boolean;
  instanceId: string;
  children: ReactNode;
  config?: {
    defaultApp?: string;
    manifestApp?: string;
    collectionApp?: string;
  };
}) {
  const { defaultApp = "splash", collectionApp = "collection-editor", manifestApp = "manifest-editor" } = config;
  const [currentApp, changeApp] = useCurrentApp(initialApp, saveCurrentApp);

  const changeProjectType = (type: "Manifest" | "Collection") => {
    if (type === "Manifest") {
      changeApp({ id: manifestApp });
    }
    if (type === "Collection") {
      changeApp({ id: collectionApp });
    }
  };

  const ctx = useMemo<MultiAppContext>(
    () => ({
      currentApp: currentApp || { id: defaultApp },
      initialApp: initialApp || { id: defaultApp },
      apps,
      changeApp,
      changeProjectType,
    }),
    [initialApp, apps, currentApp]
  );

  const currentFullApp = apps[ctx.currentApp.id];
  if (!currentApp || !currentFullApp) {
    return null;
  }

  // Current App is now put in the "Prime" context.
  return (
    <AppProvider
      appId={currentApp.id}
      definition={currentFullApp}
      instanceId={currentApp.id + instanceId}
      args={currentApp.args}
    >
      <MultiAppContext.Provider value={ctx}>{children}</MultiAppContext.Provider>
    </AppProvider>
  );
}
