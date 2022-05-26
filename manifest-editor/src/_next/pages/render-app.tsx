import { Layout } from "../../shell/Layout/Layout";
import { AppStateProvider, useApps } from "../../shell/AppContext/AppContext";
import { AppHeader } from "../../shell/AppHeader/AppHeader";

export function RenderApp() {
  const { apps, changeApp, currentApp } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;

  if (currentApp?.id === "manifest-editor") {
    return null;
  }

  return selectedApp ? (
    <AppStateProvider appId={currentApp.id} key={currentApp.id}>
      <Layout header={<AppHeader />} {...(selectedApp.layout || {})} />
    </AppStateProvider>
  ) : (
    <div>
      App ("{currentApp.id}") not found <button onClick={() => changeApp({ id: "splash" })}>Reset</button>
    </div>
  );
}
