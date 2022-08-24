import { MediaForm } from "../../editors/MediaProperties/MediaForm";
import { PaddedSidebarContainer } from "../../atoms/PaddedSidebarContainer";

export function CanvasMedia({ onAfterDelete }: { onAfterDelete?: () => void }) {
  return (
    <PaddedSidebarContainer>
      <MediaForm onAfterDelete={onAfterDelete} />
    </PaddedSidebarContainer>
  );
}
