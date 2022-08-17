import { FlexContainerColumn } from "@/components/layout/FlexContainer";
import htmlAsString from "./welcome.html?raw";
import { RaisedEditorial } from "@/_components/surfaces/RaisedEditorial/RaisedEditorial";

export function AboutText() {
  return (
    <FlexContainerColumn justify="flex-start">
      <RaisedEditorial dangerouslySetInnerHTML={{ __html: htmlAsString }} />
    </FlexContainerColumn>
  );
}
