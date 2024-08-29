import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button.tsx";
import { Modal } from "@/components/Modal.tsx";

import Email from "@/assets/icons/social/email.svg";
import LinkedIn from "@/assets/icons/social/linkedin.svg";
import { useGlobalState } from "@/hooks/useGlobalState.ts";

export const Contact = () => {
  const navigate = useNavigate();
  const setCardGameVisibility = useGlobalState(
    (state) => state.setCardGameVisibility,
  );

  setCardGameVisibility(false);

  return (
    <Modal modalName="/contact">
      <div className="space-y-4">
        <h1 className="text-3xl text-center md:text-left">Contact</h1>
        <div className="flex flex-col gap-2">
          <a href="mailto: camille.abella@proton.me" target="_blank">
            <span className="flex items-center gap-4 h-min font-sans">
              <Email className="w-5" />
              camille.abella@proton.me
            </span>
          </a>
          <a
            href="https://www.linkedin.com/in/camille-abella-a99950176/"
            target="_blank"
          >
            <span className="flex items-center gap-4 font-sans">
              <LinkedIn className="w-5" />
              LinkedIn: Camille ABELLA
            </span>
          </a>
        </div>
        <div className="flex gap-2">
          <Button
            className="hidden md:block"
            onClick={() => {
              navigate("/");
            }}
          >
            Retour
          </Button>
          <Button
            onClick={() => navigate("/pricing")}
            variant="cta"
            size="cta"
            className="mx-auto md:mx-0"
          >
            Mes tarifs
          </Button>
        </div>
      </div>
    </Modal>
  );
};
