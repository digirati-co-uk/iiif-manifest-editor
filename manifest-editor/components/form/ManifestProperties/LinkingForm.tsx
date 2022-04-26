import { FlexContainerColumn } from "../../layout/FlexContainer";
// NB remember to switch this out when "react-iiif-vault bug fixed"
import { useManifest } from "../../../hooks/useManifest";
import { ExternalResource } from "./ExternalResource";
import { InformationLink } from "../../atoms/InformationLink";

export const LinkingForm: React.FC<{}> = () => {
  const manifest = useManifest();

  return (
    <FlexContainerColumn key={manifest?.id}>
      <>
        <ExternalResource dispatchType={"homepage"} />
        <InformationLink guidanceReference="https://iiif.io/api/presentation/3.0/#homepage" />
      </>
      <>
        <ExternalResource dispatchType={"rendering"} />
        <InformationLink guidanceReference="https://iiif.io/api/presentation/3.0/#rendering" />
      </>
      <>
        <ExternalResource dispatchType={"seeAlso"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#seeAlso"}
        />
      </>
      <>
        <ExternalResource dispatchType={"service"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#service"}
        />
      </>
      <>
        <ExternalResource dispatchType={"services"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#services"}
        />
      </>
    </FlexContainerColumn>
  );
};
