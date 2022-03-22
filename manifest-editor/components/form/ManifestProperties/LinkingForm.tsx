import { FlexContainerColumn } from "../../layout/FlexContainer";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../../hooks/useManifest";
import { StringInput } from "../StringInput";
import { Input } from "../Input";

export const LinkingForm: React.FC<{}> = () => {
  const manifest = useManifest();

  console.log(manifest?.homepage);

  return (
    <FlexContainerColumn>
      {/* {manifest?.homepage.map((items) => {
        return <Input dispatchType={"homepage"}></Input>;
      })} */}
      <div>Rendering</div>
    </FlexContainerColumn>
  );
};
