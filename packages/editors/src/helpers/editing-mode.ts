import { create } from "zustand";

interface EditingMode {
  editMode: boolean;
  setIsEditing: (isEditing: boolean) => void;
  toggleEditMode: () => void;
}

export const useEditingMode = create<EditingMode>((set) => ({
  editMode: false,
  setIsEditing: (editMode: boolean) => set({ editMode }),
  toggleEditMode: () => set((state) => ({ editMode: !state.editMode })),
}));
