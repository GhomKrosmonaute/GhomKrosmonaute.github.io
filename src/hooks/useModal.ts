import { create } from "zustand";

export const useModal = create<{
  modal: false | "contact" | "tarifs";
  setModal: (modal: false | "contact" | "tarifs") => void;
}>((set) => ({
  modal: false,
  setModal: (modal: false | "contact" | "tarifs") => set({ modal }),
}));
