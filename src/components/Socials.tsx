import React from "react";
import socials from "../data/socials.json";
import { IconContext } from "react-icons";
import {
  IoLogoLinkedin,
  IoLogoDiscord,
  IoLogoTwitter,
  IoLogoGithub,
  IoLogoInstagram,
  IoLogoFacebook,
} from "react-icons/io5";
import { SiMalt } from "react-icons/si";

import "./Socials.css";

const icons = {
  IoLogoDiscord,
  IoLogoTwitter,
  IoLogoGithub,
  IoLogoLinkedin,
  IoLogoInstagram,
  IoLogoFacebook,
  SiMalt,
};

export const Socials = () => {
  return (
    <IconContext.Provider value={{ size: "2rem", color: "#7c3aedcc" }}>
      <div className="socials">
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
            {React.createElement(icons[social.icon])}
          </a>
        ))}
      </div>
    </IconContext.Provider>
  );
};
