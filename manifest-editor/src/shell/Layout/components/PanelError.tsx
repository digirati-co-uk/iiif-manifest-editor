import { PaddedSidebarContainer } from "../../../atoms/PaddedSidebarContainer";
import { ErrorMessage } from "../../../madoc/components/callouts/ErrorMessage";
import { CalltoButton } from "../../../atoms/Button";

export function PanelError(props: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <PaddedSidebarContainer>
      <ErrorMessage $banner $margin $small>
        {props.error.toString()}
      </ErrorMessage>
      <CalltoButton onClick={props.resetErrorBoundary}>Try again</CalltoButton>
    </PaddedSidebarContainer>
  );
}
