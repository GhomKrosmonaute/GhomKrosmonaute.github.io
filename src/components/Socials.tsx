import React from "react";
import socials from "../data/socials.json";
import { IconContext } from "react-icons";
import * as Io from "react-icons/io5";
import * as Si from "react-icons/si";

import "./Socials.css";

const icons = { Io, Si };

export const Socials = () => {
  return (
    <IconContext.Provider value={{ size: "2rem", color: "#7c3aedcc" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginTop: "0.5rem",
        }}
      >
        {socials.map((social) => (
          <a
            href={social.url}
            target="_blank"
            className="social"
            key={social.name}
            title={`${social.name}: ${social.username}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {/* @ts-expect-error it's ok */}
            {React.createElement(icons[social.icon.slice(0, 2)][social.icon])}
          </a>
        ))}
      </div>
    </IconContext.Provider>
  );
};
