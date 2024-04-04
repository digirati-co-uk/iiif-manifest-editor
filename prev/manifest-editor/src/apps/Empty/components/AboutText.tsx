import { FlexContainerColumn } from "@/components/layout/FlexContainer";
import htmlAsString from "./welcome.html?raw";
import { RaisedEditorial } from "@/_components/surfaces/RaisedEditorial/RaisedEditorial";
import { memo } from "react";

export const AboutText = memo(function AboutText() {
  return (
    <FlexContainerColumn justify="flex-start">
      <RaisedEditorial dangerouslySetInnerHTML={{ __html: htmlAsString }} />
    </FlexContainerColumn>
  );
});
