import React from "react";
import cross from "../assets/cross.svg";

import "./Card.css";

export const Card = (
  props: React.PropsWithChildren<{ onClose?: () => unknown }>,
) => {
  return (
    <div className="card">
      {props.onClose && (
        <button
          className="button icon reverse small"
          onClick={props.onClose}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            margin: "1rem",
          }}
        >
          <img src={cross} alt="back" />
          <div className="light" />
        </button>
      )}

      {props.children}

      <div className="light" />
    </div>
  );
};
