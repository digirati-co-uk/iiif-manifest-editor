import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { ErrorMessage } from "@manifest-editor/ui/madoc/components/callouts/ErrorMessage";
import { Button, CalltoButton } from "@manifest-editor/ui/atoms/Button";
import { ExperimentalMessage } from "@manifest-editor/ui/madoc/components/callouts/ExperimentalMessage";
import { ExperimentalIcon } from "@manifest-editor/ui/madoc/components/icons/ExperimentalIcon";
// import { LimitationError } from "../../../helpers/limitation";
// import { FixMeError } from "@/helpers/fix-me";
import { useState } from "react";
import { WarningMessage } from "@manifest-editor/ui/madoc/components/callouts/WarningMessage";

export function PanelError(props: { error: Error; resetErrorBoundary: () => void }) {
  let error = props.error.toString();
  const [isFixing, setIsFixing] = useState(false);

  // @todo come back to.
  // if (props.error instanceof FixMeError) {
  //   const errorObject = props.error;

  //   return (
  //     <PaddedSidebarContainer>
  //       <WarningMessage $banner>
  //         <ExperimentalIcon style={{ fontSize: "2.2em", margin: "0 0.3em 0 0" }} />
  //         <div>
  //           <h4 style={{ margin: 0 }}>There is a fixable error</h4>
  //           <p>{errorObject.message}</p>
  //           <Button
  //             disabled={isFixing}
  //             onClick={async () => {
  //               setIsFixing(true);
  //               await errorObject.fix();
  //               props.resetErrorBoundary();
  //               setIsFixing(false);
  //             }}
  //           >
  //             Fix error
  //           </Button>
  //         </div>
  //       </WarningMessage>
  //     </PaddedSidebarContainer>
  //   );
  // }

  // @todo come back to.
  // if (props.error instanceof LimitationError) {
  //   error = props.error.message;

  //   return (
  //     <PaddedSidebarContainer>
  //       <ExperimentalMessage $banner>
  //         <ExperimentalIcon style={{ fontSize: "2.2em", margin: "0 0.3em 0 0" }} />
  //         <div>
  //           <h4 style={{ margin: 0 }}>The manifest editor is still in development</h4>
  //           <p>{error}</p>
  //         </div>
  //       </ExperimentalMessage>
  //     </PaddedSidebarContainer>
  //   );
  // }

  return (
    <PaddedSidebarContainer>
      <ErrorMessage $margin>{error}</ErrorMessage>
      <CalltoButton onClick={props.resetErrorBoundary}>Try again</CalltoButton>
    </PaddedSidebarContainer>
  );
}
