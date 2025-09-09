import { create } from "zustand";

interface RangeSplittingStore {
  isSplitting: boolean;
  setIsSplitting: (value: boolean) => void;
  splitEffect: () => () => void;
}

export const useRangeSplittingStore = create<RangeSplittingStore>((set) => ({
  isSplitting: false,
  setIsSplitting: (value) => set({ isSplitting: value }),
  splitEffect: () => () => {
    return () => {
      set({ isSplitting: false });
    };
  },
}));
