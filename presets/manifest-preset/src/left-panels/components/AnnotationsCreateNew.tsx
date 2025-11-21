import { useRequestAnnotation } from "react-iiif-vault";

export function AnnotationsCreateNew() {
  const {} = useRequestAnnotation();
  return <div>Create new annotation</div>;
}
