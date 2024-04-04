import * as M from "./Layout.mobile";
import { useState } from "react";
import { CloseIcon } from "@/madoc/components/icons/CloseIcon";
import { DownIcon } from "@/icons/DownIcon";

export default { title: "Mobile layout" };

export const DefaultLayout = () => {
  const [left, setLeft] = useState(false);
  const [drawer, setDrawer] = useState(false);

  return (
    <div style={{ width: 400, height: 800, display: "flex", margin: "3em auto", border: "1px solid #999" }}>
      <M.Container>
        <M.CenterPanel>CENTER PANEL</M.CenterPanel>
        <M.MobileBar>
          <M.LeftBarButton onClick={() => setLeft((l) => !l)}>Left panel</M.LeftBarButton>
          <M.DrawerContainer>
            <M.DrawerButton onClick={() => setDrawer((l) => !l)}>
              <DownIcon rotate={180} />
              Metadata
            </M.DrawerButton>
          </M.DrawerContainer>
          <M.PreviewBarButton>Preview</M.PreviewBarButton>
        </M.MobileBar>
        <M.DrawerBody $open={drawer}>
          This is the metadata
          <button onClick={() => setDrawer(false)}>
            <CloseIcon />
          </button>
        </M.DrawerBody>
        <M.LeftPanel $open={left}>
          This is the left panel
          <button onClick={() => setLeft(false)}>
            <CloseIcon />
          </button>
        </M.LeftPanel>
        <M.Lightbox
          $open={left || drawer}
          onClick={() => {
            setLeft(false);
            setDrawer(false);
          }}
        />
      </M.Container>
    </div>
  );
};
