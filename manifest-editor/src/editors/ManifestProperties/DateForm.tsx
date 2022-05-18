import { useContext } from "react";

import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../hooks/useManifest";
import { useShell } from "../../context/ShellContext/ShellContext";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { Input, InputLabel } from "../Input";

export const DateForm: React.FC<{}> = () => {
  const shellContext = useShell();
  const manifest = useManifest();
  const vault = useVault();

  // TODO Date input validation on this

  const dispatchType = "navDate";
  const changeHandler = (data: string) => {
    if (manifest) {
      shellContext.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, data);
    }
  };

  const guidanceReference = "https://iiif.io/api/presentation/3.0/#navDate";

  return (
    <>
      <ErrorBoundary>
        <FlexContainer>
          <h4>{dispatchType}</h4>
          {guidanceReference && <InformationLink guidanceReference={guidanceReference} />}
        </FlexContainer>
        <Input
          type="string"
          onChange={(e: any) => {
            changeHandler(e.target.value);
          }}
          // @ts-ignore
          value={manifest && manifest[dispatchType] ? manifest[dispatchType] : ""}
        />
      </ErrorBoundary>
    </>
  );
};
