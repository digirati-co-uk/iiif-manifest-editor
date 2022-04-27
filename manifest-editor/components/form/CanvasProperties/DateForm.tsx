import { useContext } from "react";

import { useCanvas, useVault } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { FlexContainer } from "../../layout/FlexContainer";
import { Input } from "../Input";

export const DateForm: React.FC<{}> = () => {
  const shellContext = useContext(ShellContext);
  const canvas = useCanvas();
  const vault = useVault();

  // TODO Date input validation on this

  const dispatchType = "navDate";
  const changeHandler = (data: string) => {
    if (canvas) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(canvas, dispatchType, data);
    }
  };

  const guidanceReference = "https://iiif.io/api/presentation/3.0/#navDate";

  return (
    <>
      <ErrorBoundary>
        <FlexContainer>
          <h4>{dispatchType}</h4>
          {guidanceReference && (
            <InformationLink guidanceReference={guidanceReference} />
          )}
        </FlexContainer>

        <Input
          type="string"
          onChange={(e: any) => {
            changeHandler(e.target.value);
          }}
          // @ts-ignore
          value={canvas && canvas[dispatchType] ? canvas[dispatchType] : ""}
        />
      </ErrorBoundary>
    </>
  );
};
