import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/Card.tsx";
import { Button } from "@/components/ui/button.tsx";

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
      <Card
        big={props.big}
        style={props.style}
        onClose={() => {
          navigate("/", { replace: true });
        }}
      >
        {props.children}
      </Card>
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
