import { FlexContainerColumn } from "../../components/layout/FlexContainer";
import { RecentFiles } from "../../components/widgets/RecentFiles";
import { PaddingComponentLarge } from "../../atoms/PaddingComponent";
import { LoadManifest } from "../../components/widgets/LoadManifest/LoadManifest";
import { LayoutPanel } from "../../shell/Layout/Layout.types";

export default { id: "splash", title: "Splash", type: "launcher" };

export const centerPanels: LayoutPanel[] = [
  {
    id: "splash",
    label: "Splash Screen",
    icon: "",
    render: () => (
      <FlexContainerColumn style={{ height: "100%", justifyContent: "space-between" }}>
        <div>
          <PaddingComponentLarge />
          <LoadManifest />
          <PaddingComponentLarge />
        </div>
        <div style={{ width: "100%", height: "50%", backgroundColor: "white" }}>
          <FlexContainerColumn style={{ width: "90%", margin: "auto" }}>
            <RecentFiles />
          </FlexContainerColumn>
        </div>
      </FlexContainerColumn>
    ),
  },
];
