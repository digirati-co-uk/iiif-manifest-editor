import { SupportedTarget, useAnnotation } from "react-iiif-vault";
import { ContentResource } from "@iiif/presentation-3";
import { WarningMessage } from "../../madoc/components/callouts/WarningMessage";
import { EditAnnotationBodyWithoutTarget } from "../../resource-editors/annotation/EditAnnotationBodyWithoutTarget";
import { limitation } from "@/helpers/limitation";
import invariant from "tiny-invariant";

export const MediaForm = ({ onAfterDelete }: { onAfterDelete?: () => void }) => {
  const annotation = useAnnotation<{ id: string; body: ContentResource[]; target: SupportedTarget }>();

  console.log("annotaiton", annotation);

  // Does this annotation support this form?

  invariant(annotation);
  limitation(annotation.body.length <= 1, "Only support single-body annotations");
  limitation(annotation.target.type === "SpecificResource", "Unsupported annotation target");
  limitation(annotation.target.selectors.length <= 1, "Unsupported multi-target");

  const prevBody = annotation.body[0] as any;

  if (prevBody.type === "SpecificResource") {
    return <EditAnnotationBodyWithoutTarget id={prevBody.source.id} onAfterDelete={onAfterDelete} />;
  }

  return <EditAnnotationBodyWithoutTarget id={prevBody.id} onAfterDelete={onAfterDelete} />;
};
