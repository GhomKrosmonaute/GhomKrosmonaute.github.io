import React from "react";
import cross from "../assets/cross.svg";

import { useMediaQuery } from "usehooks-ts";
import { Tilt } from "./Tilt";

import "./Card.css";

export const Card = (
  props: React.PropsWithChildren<{ onClose?: () => unknown }>,
) => {
  const matches = useMediaQuery("(width >= 768px) and (height >= 768px)");

  return (
    <>
      <div className="center">
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
            <button
              className="button icon reverse small"
              onClick={props.onClose}
              style={{
                position: "absolute",
                margin: "1rem",
                right: 0,
                top: 0,
              }}
            >
              <img src={cross} alt="back" />

              <div className="light" />
            </button>
          )}

          {props.children}

          <div className="light" />
          <div className="light opposed" />
        </Tilt>
      </div>
      {props.onClose && !matches && (
        <button
          className="button"
          onClick={props.onClose}
          style={{
            position: "absolute",
            margin: "1rem",
            right: 0,
            bottom: 0,
          }}
        >
          {/*<img src={cross} alt="back" />*/}
          Retour
          <div className="light" />
        </button>
      )}
    </>
  );
};
