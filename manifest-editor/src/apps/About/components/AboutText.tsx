import { FlexContainerColumn } from "../../../components/layout/FlexContainer";
import { RecentFilesWidget } from "../../../atoms/RecentFilesWidget";
import htmlAsString from "../../../../public/welcome.html?raw";
import { EmptyCanvasState } from "../../../components/organisms/EmptyCanvasState/EmptyCanvasState";

export function AboutText() {
  return (
    <FlexContainerColumn justify="flex-start" style={{ width: "80%", margin: "auto" }}>
      <RecentFilesWidget dangerouslySetInnerHTML={{ __html: htmlAsString }} />
    </FlexContainerColumn>
  );
}
