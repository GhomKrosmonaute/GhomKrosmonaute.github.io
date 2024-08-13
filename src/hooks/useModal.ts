import { create } from "zustand";

export const useModal = create<{
  modal: false | "contact" | "tarifs";
  setModal: (modal: false | "contact" | "tarifs") => void;
}>((set) => ({
  modal:
    (localStorage.getItem("modal") as false | "contact" | "tarifs") || false,
  setModal: (modal: false | "contact" | "tarifs") => {
    set({ modal });

    if (modal) localStorage.setItem("modal", modal);
    else localStorage.removeItem("modal");
  },
}));
