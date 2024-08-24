import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { CenterCard } from "@/components/CenterCard.tsx";

export const Modal = (
  props: React.PropsWithChildren<{
    modalName: "/" | "/contact" | "/pricing" | "/card-game";
    style?: React.CSSProperties;
    big?: boolean;
  }>,
) => {
  const navigate = useNavigate();

  return (
    <>
      <CenterCard
        big={props.big}
        style={props.style}
        onClose={() => {
          navigate("/", { replace: true });
        }}
      >
        {props.children}
      </CenterCard>
      <Button
        variant="opaque"
        className="md:mdh:hidden fixed m-4 right-0 bottom-0 z-50"
        onClick={() => {
          window.location.pathname = "/";
        }}
      >
        {/*<img src={cross} alt="back" />*/}
        Retour
      </Button>
    </>
  );
};
