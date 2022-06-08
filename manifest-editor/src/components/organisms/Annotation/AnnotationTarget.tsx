type Target = {
  id: string;
};

export function AnnotationTarget({ id }: Target) {
  return <div>{!id.includes("#xywh=") ? "Whole Canvas" : id.split("#xywh=")[1]}</div>;
}
