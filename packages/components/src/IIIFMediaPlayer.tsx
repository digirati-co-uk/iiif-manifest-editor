import { lazy, Suspense } from "react";
import { Spinner } from "./Spinner";

export interface IIIFMediaPlayerProps {
  canvas: { id: string };
  media: { duration: number; format: string; url: string };
  captions?: any[];
  poster?: string;
  startTime?: number;
  language?: string;
}

const Player = lazy(() => import("./IIIFMediaPlayerImpl").then((module) => ({ default: module.IIIFMediaPlayer })));

export function IIIFMediaPlayer(props: IIIFMediaPlayerProps) {
  return (
    <Suspense fallback={<Spinner />}>
      <Player {...props} />
    </Suspense>
  );
}
