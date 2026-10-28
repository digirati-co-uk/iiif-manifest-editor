import { EditorI18nScope, useTranslations } from "@manifest-editor/i18n";
import "@vidstack/react/player/styles/base.css";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/captions.css";
import "@vidstack/react/player/styles/default/layouts/video.css";

import { MediaPlayer, MediaProvider, Poster, Gesture, Track, type MediaPlayerInstance } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
  type DefaultLayoutTranslations,
} from "@vidstack/react/player/layouts/default";
import { getValue } from "@iiif/helpers";
import { useRef } from "react";

export interface IIIFMediaPlayerProps {
  canvas: { id: string };
  media: { duration: number; format: string; url: string };
  captions?: any[];
  poster?: string;
  startTime?: number;
  language?: string;
}

export function IIIFMediaPlayer(props: IIIFMediaPlayerProps) {
  const t = useTranslations("components");
  const translations = {
    Announcements: t("media.announcements"),
    Accessibility: t("media.accessibility"),
    AirPlay: t("media.airPlay"),
    Audio: t("media.audio"),
    Auto: t("media.auto"),
    Boost: t("media.boost"),
    Captions: t("media.captions"),
    "Caption Styles": t("media.captionStyles"),
    "Captions look like this": t("media.captionsLookLikeThis"),
    Chapters: t("media.chapters"),
    "Closed-Captions Off": t("media.closedCaptionsOff"),
    "Closed-Captions On": t("media.closedCaptionsOn"),
    Connected: t("media.connected"),
    Continue: t("media.continue"),
    Connecting: t("media.connecting"),
    Default: t("media.default"),
    Disabled: t("media.disabled"),
    Disconnected: t("media.disconnected"),
    "Display Background": t("media.displayBackground"),
    Download: t("media.download"),
    "Enter Fullscreen": t("media.enterFullscreen"),
    "Enter PiP": t("media.enterPiP"),
    "Exit Fullscreen": t("media.exitFullscreen"),
    "Exit PiP": t("media.exitPiP"),
    Font: t("media.font"),
    Family: t("media.family"),
    Fullscreen: t("media.fullscreen"),
    "Google Cast": t("media.googleCast"),
    "Keyboard Animations": t("media.keyboardAnimations"),
    LIVE: t("media.live"),
    Loop: t("media.loop"),
    Mute: t("media.mute"),
    Normal: t("media.normal"),
    Off: t("media.off"),
    Pause: t("media.pause"),
    Play: t("media.play"),
    Playback: t("media.playback"),
    PiP: t("media.piP"),
    Quality: t("media.quality"),
    Replay: t("media.replay"),
    Reset: t("media.reset"),
    "Seek Backward": t("media.seekBackward"),
    "Seek Forward": t("media.seekForward"),
    Seek: t("media.seek"),
    Settings: t("media.settings"),
    "Skip To Live": t("media.skipToLive"),
    Speed: t("media.speed"),
    Size: t("media.size"),
    Color: t("media.color"),
    Opacity: t("media.opacity"),
    Shadow: t("media.shadow"),
    Text: t("media.text"),
    "Text Background": t("media.textBackground"),
    Track: t("media.track"),
    Unmute: t("media.unmute"),
    Volume: t("media.volume"),
  } satisfies DefaultLayoutTranslations;
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
        <EditorI18nScope>
          <DefaultVideoLayout
            className="z-1"
            translations={translations}
            //
            noGestures
            icons={defaultLayoutIcons}
          />
        </EditorI18nScope>
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
