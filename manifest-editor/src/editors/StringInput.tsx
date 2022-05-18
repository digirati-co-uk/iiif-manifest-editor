import { Input } from "./Input";
import { useVault } from "react-iiif-vault";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../hooks/useManifest";
import { useContext, useEffect, useState } from "react";
import { CalltoButton } from "../atoms/Button";
import { FlexContainer } from "../components/layout/FlexContainer";
import ShellContext from "../apps/Shell/ShellContext";

export const StringInput: React.FC<{
  // Add to this list as we go
  dispatchType: "type" | "viewingDirection" | "@context";
}> = ({ dispatchType }) => {
  const shellContext = useContext(ShellContext);
  const manifest = useManifest();
  const vault = useVault();
  const [save, setSave] = useState(0);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (manifest && save >= 1) {
      shellContext?.setUnsavedChanges(true);
      vault.modifyEntityField(manifest, dispatchType, inputValue);
    }
  }, [save]);

  return (
    <>
      <h4>{dispatchType}</h4>
      <Input
        key={dispatchType}
        // @ts-ignore
        defaultValue={manifest && manifest[dispatchType]}
        onChange={(e: any) => setInputValue(e.target.value)}
      />
      <FlexContainer>
        <CalltoButton aria-label="save" onClick={() => setSave(1 + save)}>
          Save
        </CalltoButton>
      </FlexContainer>
    </>
  );
};
