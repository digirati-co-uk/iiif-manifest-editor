import create from "zustand";
import { useMemo } from "react";

interface AnnotationEditing {
  annotationId: string | null;
  setAnnotation: (id: string | null) => void;
  clear: () => void;
}

export const useAnnotationEditing = create<AnnotationEditing>((set) => ({
  annotationId: null,
  setAnnotation: (id: string | null) => set({ annotationId: id }),
  clear: () => set({ annotationId: null }),
}));
