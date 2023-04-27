import { Layout } from "../../shell/Layout/Layout";
import { AppStateProvider, useApps } from "../../shell/AppContext/AppContext";
import { AppHeader } from "../../shell/AppHeader/AppHeader";
import { useIsDesktop } from "../../shell/DesktopContext/hooks/useIsDesktop";
import { AppHeaderDesktop } from "../../shell/AppHeader/AppHeader.desktop";
import { memo } from "react";
import { useProjectContext } from "@/shell/ProjectContext/ProjectContext";

export const RenderApp = memo(function RenderApp() {
  const isDesktop = useIsDesktop();
  const { apps, changeApp, currentApp, initialApp } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  const project = useProjectContext();
  const type = project.current?.resource.type;

  if (selectedApp && selectedApp.metadata.project && selectedApp.metadata.projectType !== type) {
    return (
      <div>
        App {selectedApp.metadata.id} not supported for resource (found {type}, expected{" "}
        {selectedApp.metadata.projectType})<button onClick={() => changeApp(initialApp)}>Reset</button>
      </div>
    );
  }

  return selectedApp ? (
    <AppStateProvider appId={currentApp.id} key={currentApp.id} args={currentApp.args}>
      <Layout header={isDesktop ? <AppHeaderDesktop /> : <AppHeader />} {...(selectedApp.layout || {})} />
    </AppStateProvider>
  ) : (
    <div>
      App ("{currentApp.id}") not found <button onClick={() => changeApp(initialApp)}>Reset</button>
    </div>
  );
});
