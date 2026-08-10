import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/captions.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider, Poster, Gesture, Track, type MediaPlayerInstance } from "@vidstack/react";
import { defaultLayoutIcons, DefaultVideoLayout } from "@vidstack/react/player/layouts/default";
import { getValue } from "@iiif/helpers";
import { useRef } from "react";

// Things not to forget
// - Annoucer translations

export interface IIIFMediaPlayerProps {
  canvas: { id: string };
  media: { duration: number; format: string; url: string };
  captions?: any[];
  poster?: string;
  startTime?: number;
  language?: string;
}

export function IIIFMediaPlayer(props: IIIFMediaPlayerProps) {
  const mediaPlayer = useRef<MediaPlayerInstance>(null);
  const captions = props.captions || [];
  const language = props.language;
  const timeRef = useRef<number>(props.startTime || 0);

  return (

    <MediaPlayer
      onTimeUpdate={(time) => {
        const newT = Math.round(time.currentTime);
        if (timeRef.current === newT) return;
        timeRef.current = newT;
      }}
      ref={mediaPlayer}
      lang={language}
      className="h-full w-full min-w-[275px] flex radius-0"
      playsInline
      currentTime={props.startTime}
      duration={props.media.duration}
      // Use the selector to clip it.
      // clipEndTime={...}
      // clipStartTime={...}
      src={[
        {
          src: props.media.url,
          type: props.media.format as any,
        },
      ]}
    >
      <MediaProvider className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-contain">
        {/* VTT */}
        {captions.map((caption: any) => {
          return (
            <Track
              key={caption.id}
              src={caption.id}
              kind="subtitles"
              label={getValue(caption.label)}
              default={caption.language === language}
              language={caption.language}
            />
          );
        })}

        {/* Chapters from Ranges */}
        {/* {chapters.length ? (
          <Track content={chapters as any} type="json" kind="chapters" label="Chapters" default />
        ) : null} */}
        {/* <Track content={exampleChapters} type="json" kind="chapters" label="Chapters" default /> */}

        {/* This is the Placeholder Canvas from the IIIF Canvas */}
        {props.poster ? (
          <Poster
            className="absolute inset-0 bg-black block h-full w-full opacity-0 transition-opacity data-[visible]:opacity-100 object-contain"
            src={props.poster}
          />
        ) : null}
        <Gestures />
        <DefaultVideoLayout
          className="z-1"
          //
          noGestures
          icons={defaultLayoutIcons}
        />
      </MediaProvider>
    </MediaPlayer>
  );
}

function Gestures() {
  return (
    <>
      <Gesture
        className="pointer-coarse:hidden absolute top-0 start-12 bottom-20 right-0 -z-1 block"
        event="pointerup"
        action="toggle:paused"
      />
      <Gesture className="absolute inset-0 z-0 block h-full w-full" event="dblpointerup" action="toggle:fullscreen" />
    </>
  );
}
