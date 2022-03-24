import { useContext } from "react";

import { useCanvas, useVault } from "react-iiif-vault";
import ShellContext from "../../apps/Shell/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { Input, InputLabel } from "../Input";
import { ShadowContainer } from "../../atoms/ShadowContainer";

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
    <ShadowContainer>
      <ErrorBoundary>
        <InputLabel>{dispatchType}</InputLabel>
        <Input
          type="string"
          onChange={(e: any) => {
            changeHandler(e.target.value);
          }}
          // @ts-ignore
          value={canvas && canvas[dispatchType] ? canvas[dispatchType] : ""}
        />
        <InformationLink guidanceReference={guidanceReference} />
      </ErrorBoundary>
    </ShadowContainer>
  );
};
