import { SupportedTarget, useAnnotation } from "react-iiif-vault";
import { ContentResource } from "@iiif/presentation-3";
import { WarningMessage } from "../../madoc/components/callouts/WarningMessage";
import { EditAnnotationBodyWithoutTarget } from "../../resource-editors/annotation/EditAnnotationBodyWithoutTarget";

export const MediaForm = () => {
  const annotation = useAnnotation<{ id: string; body: ContentResource[]; target: SupportedTarget }>();

  // Does this annotation support this form?
  if (
    // No annotation.
    !annotation ||
    // Or more than one annotation body
    annotation.body.length > 1 ||
    // Multi-targets = nope!
    annotation.target.type !== "SpecificResource" ||
    annotation.target.selectors.length > 1
  ) {
    return <WarningMessage>This type of media is unsupported</WarningMessage>;
  }

  const prevBody = annotation.body[0] as any;

  return <EditAnnotationBodyWithoutTarget id={prevBody.id} />;
};
