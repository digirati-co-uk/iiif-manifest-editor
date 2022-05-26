import { FlexContainerColumn } from "../../components/layout/FlexContainer";
import { ExternalResource } from "./ExternalResource";
import { useCanvas } from "react-iiif-vault";

export const LinkingForm: React.FC<{}> = () => {
  const canvas = useCanvas();

  return (
    <FlexContainerColumn key={canvas?.id}>
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
    </FlexContainerColumn>
  );
};
