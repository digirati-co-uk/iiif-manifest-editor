import { FlexContainerColumn } from "../../layout/FlexContainer";
import { ExternalResource } from "./ExternalResource";
import { InformationLink } from "../../atoms/InformationLink";
import { useCanvas } from "react-iiif-vault";

export const LinkingForm: React.FC<{}> = () => {
  const canvas = useCanvas();

  return (
    <FlexContainerColumn key={canvas?.id}>
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
    </FlexContainerColumn>
  );
};
