/**
 * Dutch (nl) — ui namespace
 *
 * Media control labels use established Dutch translations from common media players.
 * "Dempen opheffen" is more natural than "Geluid inschakelen" for unmute.
 */
export const catalog = {
  media: {
    play: "Afspelen",
    pause: "Pauzeren",
    mute: "Dempen",
    unmute: "Dempen opheffen",
    volume: "Volume",
  },
  canvas: {
    new: "Nieuw canvas",
    width: "Breedte",
    height: "Hoogte",
  },
  loading: {
    title: "Laden…",
  },
  error: {
    title: "Er is iets misgegaan",
  },
} as const;
