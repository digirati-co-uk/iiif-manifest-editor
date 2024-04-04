import { FlexContainerColumn } from "../../components/layout/FlexContainer";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../hooks/useManifest";
import { ExternalResource } from "./ExternalResource";

export const LinkingForm: React.FC<{}> = () => {
  const manifest = useManifest();

  return (
    <FlexContainerColumn key={manifest?.id}>
      <>
        <ExternalResource
          dispatchType={"homepage"}
          guidanceReference="https://iiif.io/api/presentation/3.0/#homepage"
        />
      </>
      <>
        <ExternalResource
          dispatchType={"rendering"}
          guidanceReference="https://iiif.io/api/presentation/3.0/#rendering"
        />
      </>
      <>
        <ExternalResource
          dispatchType={"seeAlso"}
          guidanceReference={"https://iiif.io/api/presentation/3.0/#seeAlso"}
        />
      </>
      <>
        <ExternalResource
          dispatchType={"service"}
          guidanceReference={"https://iiif.io/api/presentation/3.0/#service"}
        />
      </>
      <>
        <ExternalResource
          dispatchType={"services"}
          guidanceReference={"https://iiif.io/api/presentation/3.0/#services"}
        />
      </>
    </FlexContainerColumn>
  );
};
