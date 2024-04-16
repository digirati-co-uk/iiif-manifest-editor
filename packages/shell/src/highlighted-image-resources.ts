import { create } from "zustand";
import { useEffect, useMemo } from "react";
import { randomId } from "./helpers";

type Projection = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface HighlightedImageResources {
  regions: Record<string, Projection | null>;
  resources: string[];
  setRegion: (id: string, region?: Projection | null) => void;
  setHighlight: (id: string | string[]) => void;
  highlight: (id: string) => void;
  clearHighlight: (id: string) => void;
}

export const useHighlightedImageResource = create<HighlightedImageResources>((set) => ({
  regions: {},
  resources: [],
  setRegion: (id, region) => {
    set((ex) => ({ ...ex.regions, regions: { [id]: region || null } }));
  },
  setHighlight: (id: string | string[]) => {
    set({ resources: Array.isArray(id) ? id : [id] });
  },
  highlight: (id) => {
    set((s) => {
      if (s.resources.indexOf(id) !== -1) {
        return s;
      }
      return { resources: [...s.resources, id] };
    });
  },
  clearHighlight: (id) => {
    set((s) => ({ resources: s.resources.filter((item) => item !== id) }));
  },
}));

export function useTemporaryHighlight(newValue?: Projection | null) {
  const id = useMemo(() => randomId(), []);
  const value = useHighlightedImageResource((s) => s.regions[id]);
  const setRegion = useHighlightedImageResource((s) => s.setRegion);

  useEffect(() => {
    if (value && newValue) {
      if (
        value !== newValue &&
        (value.x !== newValue.x ||
          value.y !== newValue.y ||
          value.width !== newValue.width ||
          value.height !== newValue.height)
      ) {
        setRegion(id, newValue || null);
      }
    } else {
      setRegion(id, newValue || null);
    }
  }, [value]);

  useEffect(() => {
    return () => setRegion(id, null);
  }, []);
}

export function useHoverHighlightImageResource(id?: string) {
  const highlight = useHighlightedImageResource((s) => s.highlight);
  const clear = useHighlightedImageResource((s) => s.clearHighlight);

  useEffect(() => {
    return () => {
      if (id) {
        clear(id);
      }
    };
  }, [clear, id]);

  return useMemo(() => {
    return {
      onMouseEnter() {
        if (id) {
          highlight(id);
        }
      },
      onMouseLeave() {
        if (id) {
          clear(id);
        }
      },
    };
  }, [id, highlight, clear]);
}
