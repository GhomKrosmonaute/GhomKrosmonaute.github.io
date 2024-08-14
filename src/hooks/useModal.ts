import { create } from "zustand";

type ModalType = false | "contact" | "tarifs" | "game";

export const useModal = create<{
  modal: ModalType;
  setModal: (modal: ModalType) => void;
}>((set) => ({
  modal: (localStorage.getItem("modal") as ModalType) || false,
  setModal: (modal: ModalType) => {
    set({ modal });

    if (modal) localStorage.setItem("modal", modal);
    else localStorage.removeItem("modal");
  },
}));
