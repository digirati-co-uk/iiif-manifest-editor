import { LayoutPanel } from "@/shell";
import { FlexContainerColumn } from "@/components/layout/FlexContainer";
import { PaddingComponentLarge } from "@/atoms/PaddingComponent";
import { LoadManifest } from "@/components/widgets/LoadManifest/LoadManifest";
import { RecentFiles } from "@/components/widgets/RecentFiles";
import { GithubContext } from "@/shell/DesktopContext/components/GithubContext";

export default { id: "splash", title: "Splash", type: "launcher", desktop: true };

export const centerPanels: LayoutPanel[] = [
  {
    id: "splash",
    label: "Desktop splash",
    icon: "",
    render: () => (
      <FlexContainerColumn style={{ height: "100%", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ padding: 80 }}>Manifest Editor Desktop</h2>
          <PaddingComponentLarge />
          <LoadManifest />
          <PaddingComponentLarge />
          <div style={{ padding: 80 }}>
            <GithubContext />
          </div>

          <div style={{ width: "100%", height: "50%", backgroundColor: "white" }}>
            <FlexContainerColumn style={{ width: "90%", margin: "auto" }}>
              <RecentFiles />
            </FlexContainerColumn>
          </div>
        </div>
      </FlexContainerColumn>
    ),
  },
];
