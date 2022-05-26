import { useVault } from "react-iiif-vault";
import { useManifest } from "../../hooks/useManifest";
import { ErrorBoundary } from "../../atoms/ErrorBoundary";
import { InformationLink } from "../../atoms/InformationLink";
import { FlexContainer } from "../../components/layout/FlexContainer";
import { Input } from "../Input";

export const DateForm: React.FC<{}> = () => {
  const manifest = useManifest();
  const vault = useVault();

  // TODO Date input validation on this

  const dispatchType = "navDate";
  const changeHandler = (data: string) => {
    if (manifest) {
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
