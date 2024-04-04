import { LanguageMapInputCanvas } from "./LanguageMapInputCanvas";
import { SingleValueInput } from "./SingleValueInputCanvas";
import { DateForm } from "./DateForm";
import { ThumbnailForm } from "./ThumbnailForm";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";

export const DescriptiveForm = () => {
  return (
    <PaddedSidebarContainer>
      <LanguageMapInputCanvas
        dispatchType={"label"}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#label"}
      />
      <LanguageMapInputCanvas
        dispatchType={"summary"}
        guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
      />
      <SingleValueInput dispatchType={"rights"} />
      <DateForm />
      <ThumbnailForm />
    </PaddedSidebarContainer>
  );
};
