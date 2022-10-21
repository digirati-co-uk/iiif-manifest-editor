import { formatTime, useMediaActions, useMediaElements, useMediaState } from "react-iiif-vault";
import { useState } from "react";
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
import { VisuallyHiddenLabel } from "@/atoms/VisuallHidden/VisuallHidden";
import { Spinner } from "@/madoc/components/icons/Spinner";

export function MediaControls() {
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const { progress, currentTime } = useMediaElements();
  const { duration, isMuted, volume, isPlaying, playRequested } = useMediaState();
  const { setVolume, toggleMute, play, pause, setDurationPercent } = useMediaActions();

  // Volume Icon to use.
  const Volume = isMuted || volume === 0 ? VolumeOffIcon : volume > 50 ? VolumeUpIcon : VolumeDownIcon;

  return (
    <AudioPlayerContainer>
      <PlayButton
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
          <PauseIcon title={"Pause"} />
        ) : (
          <PlayIcon title={"Play"} />
        )}
      </PlayButton>
      <TimeDisplay ref={currentTime}>0:00</TimeDisplay>
      <ProgressContainer
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
            <VisuallyHiddenLabel htmlFor="audio-slider">{"Change volume"}</VisuallyHiddenLabel>
            <VolumeSlider
              id="audio-slider"
              role="slider"
              disabled={isMuted}
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.currentTarget.value))}
            />
          </span>
        </VolumeContainer>
        <SoundButton onClick={() => toggleMute()}>
          <Volume title={isMuted ? "Mute" : "Unmute"} />
        </SoundButton>
      </SoundContainer>
    </AudioPlayerContainer>
  );
}
