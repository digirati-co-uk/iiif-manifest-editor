import { useTranslations } from "@manifest-editor/i18n";
import { formatTime, useMediaActions, useMediaElements, useMediaState } from "react-iiif-vault";
import { useId, useLayoutEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon, VolumeDownIcon, VolumeOffIcon, VolumeUpIcon } from "./MediaControls.icons";
import {
  AudioPlayerContainer,
  PlayButton,
  ProgressBackground,
  ProgressContainer,
  TimeDisplay,
  ProgressCurrent,
  SoundContainer,
  VolumeContainer,
  SoundButton,
  VolumeSlider,
} from "./MediaControls.styles";
import { Spinner } from "../../madoc/components/icons/Spinner";
import { VisuallyHiddenLabel } from "../../atoms/VisuallHidden/VisuallHidden";

export function MediaControls(props: {
  onDimensions?: (width: number, height: number) => void;
  onError?: (error: string) => void;
  onDuration?: (duration: number) => void;
}) {
  const t = useTranslations("ui");
  const sliderId = useId();
  const callbacks = useRef(props);
  callbacks.current = props;
  const translate = useRef(t);
  translate.current = t;
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const { progress, currentTime, element } = useMediaElements();
  const { duration, isMuted, volume, isPlaying, playRequested } = useMediaState();
  const { setVolume, toggleMute, play, pause, setDurationPercent } = useMediaActions();

  // Volume Icon to use.
  const Volume = isMuted || volume === 0 ? VolumeOffIcon : volume > 50 ? VolumeUpIcon : VolumeDownIcon;

  useLayoutEffect(() => {
    if (element.current) {
      const $el = element.current;
      if ($el.error && callbacks.current.onError) {
        callbacks.current.onError($el.error?.message || translate.current("media.unknownError"));
        return;
      }
      const onError = () => {
        if (callbacks.current.onError) {
          callbacks.current.onError($el.error?.message || translate.current("media.unknownError"));
        }
      };
      const loadedMetadata = () => {
        if ($el.duration && callbacks.current.onDuration) {
          callbacks.current.onDuration($el.duration);
        }
        if (callbacks.current.onDimensions && $el instanceof HTMLVideoElement) {
          callbacks.current.onDimensions($el.videoWidth, $el.videoHeight);
        }
      };
      $el.addEventListener("loadedmetadata", loadedMetadata);
      $el.addEventListener("error", onError);
      return () => {
        $el.removeEventListener("loadedmetadata", loadedMetadata);
        $el.removeEventListener("error", onError);
      };
    }
  }, [element]);

  return (
    <AudioPlayerContainer>
      <PlayButton
        aria-label={playRequested ? t("loading.title") : isPlaying ? t("media.pause") : t("media.play")}
        disabled={playRequested}
        onClick={() => {
          if (isPlaying) {
            pause();
          } else {
            play();
          }
        }}
      >
        {playRequested ? (
          <Spinner stroke="#999" />
        ) : isPlaying ? (
          <PauseIcon title={t("media.pause")} />
        ) : (
          <PlayIcon title={t("media.play")} />
        )}
      </PlayButton>
      <TimeDisplay ref={currentTime}>0:00</TimeDisplay>
      <ProgressContainer
        aria-label={t("media.seek")}
        title={t("media.seek")}
        onClick={(e) => {
          const { left, width } = e.currentTarget.getBoundingClientRect();
          const percent = (e.pageX - left) / width;
          setDurationPercent(percent);
        }}
      >
        <ProgressBackground />
        {duration ? <ProgressCurrent ref={progress} /> : null}
      </ProgressContainer>
      <TimeDisplay>{formatTime(duration)}</TimeDisplay>
      <SoundContainer onMouseEnter={() => setIsVolumeOpen(true)} onMouseLeave={() => setIsVolumeOpen(false)}>
        <VolumeContainer $isOpen={isVolumeOpen}>
          <span>
            <VisuallyHiddenLabel htmlFor={sliderId}>{t("media.changeVolume")}</VisuallyHiddenLabel>
            <VolumeSlider
              id={sliderId}
              disabled={isMuted}
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.currentTarget.value))}
            />
          </span>
        </VolumeContainer>
        <SoundButton aria-label={isMuted ? t("media.unmute") : t("media.mute")} onClick={() => toggleMute()}>
          <Volume title={isMuted ? t("media.unmute") : t("media.mute")} />
        </SoundButton>
      </SoundContainer>
    </AudioPlayerContainer>
  );
}
