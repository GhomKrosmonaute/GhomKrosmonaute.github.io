import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/Card.tsx";

export const Modal = (
  props: React.PropsWithChildren<{
    modalName: "/" | "/contact" | "/pricing" | "/card-game";
    style?: React.CSSProperties;
    big?: boolean;
  }>,
) => {
  const navigate = useNavigate();

  return (
    <Card
      big={props.big}
      style={props.style}
      onClose={() => {
        navigate("/", { replace: true });
      }}
    >
      {props.children}
    </Card>
  );
};
