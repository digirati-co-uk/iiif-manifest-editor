import { Layout } from "../../shell/Layout/Layout";
import { AppStateProvider, useApps } from "../../shell/AppContext/AppContext";
import { AppHeader } from "../../shell/AppHeader/AppHeader";
import { useIsDesktop } from "../../shell/DesktopContext/hooks/useIsDesktop";
import { AppHeaderDesktop } from "../../shell/AppHeader/AppHeader.desktop";

export function RenderApp() {
  const isDesktop = useIsDesktop();
  const { apps, changeApp, currentApp } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;

  console.log({ isDesktop });

  return selectedApp ? (
    <AppStateProvider appId={currentApp.id} key={currentApp.id}>
      <Layout header={isDesktop ? <AppHeaderDesktop /> : <AppHeader />} {...(selectedApp.layout || {})} />
    </AppStateProvider>
  ) : (
    <div>
      App ("{currentApp.id}") not found <button onClick={() => changeApp({ id: "splash" })}>Reset</button>
    </div>
  );
}
