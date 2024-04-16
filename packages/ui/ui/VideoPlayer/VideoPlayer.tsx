import { CanvasPanel, MediaPlayerProvider, useSimpleMediaPlayer } from "react-iiif-vault";
import { SingleVideo } from "react-iiif-vault";
import { MediaControls } from "../MediaControls/MediaControls";

export function VideoPlayer({
  media,
  onError,
  duration,
  onDuration,
  onDimensions,
}: {
  media: SingleVideo;
  duration: number;
  onError?: (error: string) => void;
  onDuration?: (duration: number) => void;
  onDimensions?: (width: number, height: number) => void;
}) {
  const [{ element, currentTime, progress }, state, actions] = useSimpleMediaPlayer({ duration: duration });

  return (
    <MediaPlayerProvider
      element={element}
      state={state}
      actions={actions}
      currentTime={currentTime}
      progress={progress}
    >
      <div
        style={{
          maxHeight: 400,
          aspectRatio: `${(media as any).width}/${(media as any).height}`,
          position: "relative",
        }}
      >
        <CanvasPanel.VideoHTML element={element} media={media} playPause={actions.playPause} />
      </div>
      <MediaControls onError={onError} onDuration={onDuration} onDimensions={onDimensions} />
    </MediaPlayerProvider>
  );
}
