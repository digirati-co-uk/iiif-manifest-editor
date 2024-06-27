import { ManifestOpener } from "./components/ManifestOpener/ManifestOpener";
import { SplashTabs } from "./components/SplashTabs/SplashTabs";
import { GettingStarted } from "./components/GettingStarted/GettingStarted";
import { MyProjects } from "./components/MyProjects/MyProjects";
import { LayoutPanel } from "@manifest-editor/shell";

export default { id: "splash", title: "Splash", type: "launcher", web: true, drafts: false };

export const centerPanels: LayoutPanel[] = [
  {
    id: "splash",
    label: "Splash Screen",
    icon: "",
    render: () => (
      <div style={{ flex: 1, background: "#fff", overflowY: "auto" }}>
        <ManifestOpener />
        <SplashTabs>
          {{
            "getting-started": <GettingStarted />,
            "my-projects": <MyProjects />,
          }}
        </SplashTabs>
      </div>
    ),
  },
];
