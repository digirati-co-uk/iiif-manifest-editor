import create from "zustand";
import { useMemo } from "react";

interface HighlightedImageResources {
  resources: string[];
  setHighlight: (id: string | string[]) => void;
  highlight: (id: string) => void;
  clearHighlight: (id: string) => void;
}

export const useHighlightedImageResource = create<HighlightedImageResources>((set) => ({
  resources: [],
  setHighlight: (id: string | string[]) => set({ resources: Array.isArray(id) ? id : [id] }),
  highlight: (id) =>
    set((s) => {
      if (s.resources.indexOf(id) !== -1) {
        return s;
      }
      return { resources: [...s.resources, id] };
    }),
  clearHighlight: (id) => set((s) => ({ resources: s.resources.filter((item) => item !== id) })),
}));

export function useHoverHighlightImageResource(id: string) {
  const highlight = useHighlightedImageResource((s) => s.highlight);
  const clear = useHighlightedImageResource((s) => s.clearHighlight);

  return useMemo(() => {
    return {
      onMouseEnter() {
        highlight(id);
      },
      onMouseLeave() {
        clear(id);
      },
    };
  }, [id, highlight, clear]);
}
