import { LocaleString, useCanvas } from "react-iiif-vault";

export function CanvasLabel(props: { className?: string; as?: string }) {
  const canvas = useCanvas();
  if (!canvas) return null;
  return (
    <LocaleString className={props.className} as={props.as}>
      {canvas.label}
    </LocaleString>
  );
}
