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
        <h3>homepage</h3>
        <ExternalResource dispatchType={"homepage"} />
        <InformationLink guidanceReference="https://iiif.io/api/presentation/3.0/#homepage" />
      </>
      <>
        <h3>rendering</h3>
        <ExternalResource dispatchType={"rendering"} />
        <InformationLink guidanceReference="https://iiif.io/api/presentation/3.0/#rendering" />
      </>
      <>
        <h3>seeAlso</h3>
        <ExternalResource dispatchType={"seeAlso"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#seeAlso"}
        />
      </>
      <>
        <h3>service</h3>
        <ExternalResource dispatchType={"service"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#service"}
        />
      </>
      <>
        <h3>services</h3>
        <ExternalResource dispatchType={"services"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#services"}
        />
      </>
    </FlexContainerColumn>
  );
};
