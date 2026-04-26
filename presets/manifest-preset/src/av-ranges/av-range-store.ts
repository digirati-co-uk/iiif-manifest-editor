import { create } from "zustand";

interface AvRangeStore {
  canvasId: string | null;
  selectedRangeId: string | null;
  draft: { start: number; end: number } | null;
  markStart: number | null;
  setCanvasId: (canvasId: string | null) => void;
  setSelectedRangeId: (rangeId: string | null) => void;
  setDraft: (draft: { start: number; end: number } | null) => void;
  setMarkStart: (time: number | null) => void;
}

export const useAvRangeStore = create<AvRangeStore>((set) => ({
  canvasId: null,
  selectedRangeId: null,
  draft: null,
  markStart: null,
  setCanvasId: (canvasId) =>
    set({ canvasId, selectedRangeId: null, draft: null, markStart: null }),
  setSelectedRangeId: (selectedRangeId) => set({ selectedRangeId }),
  setDraft: (draft) => set({ draft }),
  setMarkStart: (markStart) => set({ markStart }),
}));
