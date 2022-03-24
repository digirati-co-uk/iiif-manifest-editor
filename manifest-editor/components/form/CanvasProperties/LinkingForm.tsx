import { FlexContainerColumn } from "../../layout/FlexContainer";
import { ExternalResource } from "./ExternalResource";
import { ShadowContainer } from "../../atoms/ShadowContainer";
import { InformationLink } from "../../atoms/InformationLink";
import { useCanvas } from "react-iiif-vault";

export const LinkingForm: React.FC<{}> = () => {
  const canvas = useCanvas();

  return (
    <FlexContainerColumn key={canvas?.id}>
      <ShadowContainer>
        <h3>homepage</h3>
        <ExternalResource dispatchType={"homepage"} />
        <InformationLink guidanceReference="https://iiif.io/api/presentation/3.0/#homepage" />
      </ShadowContainer>
      <ShadowContainer>
        <h3>rendering</h3>
        <ExternalResource dispatchType={"rendering"} />
        <InformationLink guidanceReference="https://iiif.io/api/presentation/3.0/#rendering" />
      </ShadowContainer>
      <ShadowContainer>
        <h3>seeAlso</h3>
        <ExternalResource dispatchType={"seeAlso"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#seeAlso"}
        />
      </ShadowContainer>
      <ShadowContainer>
        <h3>service</h3>
        <ExternalResource dispatchType={"service"} />
        <InformationLink
          guidanceReference={"https://iiif.io/api/presentation/3.0/#service"}
        />
      </ShadowContainer>
    </FlexContainerColumn>
  );
};
