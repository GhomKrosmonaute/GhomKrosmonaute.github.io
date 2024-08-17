import React from "react";
import cross from "../assets/cross.svg";

import { useMediaQuery } from "usehooks-ts";
import { Tilt } from "./Tilt";
import { clsx } from "clsx";

import "./Card.css";
import { Button } from "@/components/ui/button.tsx";

export const Card = (
  props: React.PropsWithChildren<{
    onClose?: () => unknown;
    className?: string;
  }>,
) => {
  const matches = useMediaQuery("(width >= 768px) and (height >= 768px)");

  return (
    <>
      <div className={clsx("center", props.className)}>
        <Tilt
          className="card"
          options={
            matches
              ? {}
              : {
                  max: 0,
                  scale: "1",
                }
          }
        >
          {props.onClose && matches && (
            <Button
              className="reverse absolute top-0 right-0 m-4"
              variant="icon"
              size="sm"
              onClick={props.onClose}
            >
              <img src={cross} alt="back" />
            </Button>
          )}

          {props.children}

          <div className="light" />
          <div className="light opposed" />
        </Tilt>
      </div>
    </>
  );
};
