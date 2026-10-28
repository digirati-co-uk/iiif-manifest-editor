/** Initial seed catalog; the module inventory tracks the remaining migration. */
export const catalog = {
  media: {
    play: "Play",
    pause: "Pause",
    mute: "Mute",
    unmute: "Unmute",
    volume: "Volume",
  },
  canvas: {
    new: "New canvas",
    width: "Width",
    height: "Height",
  },
  loading: {
    title: "Loading…",
  },
  error: {
    title: "Something went wrong",
  },
} as const;
