import { useCanvas } from "@hyperion-framework/react-vault";
export const CanvasView: React.FC = () => {
  const canvas = useCanvas();
  console.log(canvas)
  return <div>I am the canvas view. I will be CanvasPanel?</div>;
};
