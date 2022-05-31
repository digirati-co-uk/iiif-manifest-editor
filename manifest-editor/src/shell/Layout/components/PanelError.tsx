import { PaddedSidebarContainer } from "../../../atoms/PaddedSidebarContainer";
import { ErrorMessage } from "../../../madoc/components/callouts/ErrorMessage";
import { CalltoButton } from "../../../atoms/Button";
import { ExperimentalMessage } from "../../../madoc/components/callouts/ExperimentalMessage";
import { ExperimentalIcon } from "../../../madoc/components/icons/ExperimentalIcon";
import { LimitationError } from "../../../helpers/limitation";

export function PanelError(props: { error: Error; resetErrorBoundary: () => void }) {
  let error = props.error.toString();

  if (props.error instanceof LimitationError) {
    error = props.error.message;

    return (
      <PaddedSidebarContainer>
        <ExperimentalMessage $banner>
          <ExperimentalIcon style={{ fontSize: "2.2em", margin: "0 0.3em 0 0" }} />
          <div>
            <h4 style={{ margin: 0 }}>The manifest editor is still in development</h4>
            <p>{error}</p>
          </div>
        </ExperimentalMessage>
      </PaddedSidebarContainer>
    );
  }

  return (
    <PaddedSidebarContainer>
      <ErrorMessage $margin>{error}</ErrorMessage>
      <CalltoButton onClick={props.resetErrorBoundary}>Try again</CalltoButton>
    </PaddedSidebarContainer>
  );
}
