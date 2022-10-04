import { LayoutPanel } from "@/shell/Layout/Layout.types";
import { ManifestOpener } from "@/apps/Splash/components/ManifestOpener/ManifestOpener";
import { SplashTabs } from "@/apps/Splash/components/SplashTabs/SplashTabs";
import { GettingStarted } from "@/apps/Splash/components/GettingStarted/GettingStarted";
import { MyProjects } from "@/apps/Splash/components/MyProjects/MyProjects";

export default { id: "splash", title: "Splash", type: "launcher", web: true, drafts: false };

export const centerPanels: LayoutPanel[] = [
  {
    id: "splash",
    label: "Splash Screen",
    icon: "",
    render: () => (
      <div style={{ flex: 1, background: "#fff" }}>
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
