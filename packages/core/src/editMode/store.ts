import { createStore } from 'zustand/vanilla';

export interface CMSEditModeState {
  isEditing: boolean;
  toggleEditMode: () => void;
  setEditing: (next: boolean) => void;
}

export const editModeStore = createStore<CMSEditModeState>((set, get) => ({
  isEditing: false,
  toggleEditMode() {
    set({ isEditing: !get().isEditing });
  },
  setEditing(next) {
    set({ isEditing: next });
  },
}));

