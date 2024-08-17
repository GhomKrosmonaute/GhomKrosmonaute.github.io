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
import { clsx } from "clsx";

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
      <div className={clsx("flex justify-center gap-1.5 mt-2", "md:gap-4")}>
        {socials.map((social) => (
          <a
            href={social.url}
            target="_blank"
            className={clsx(
              "inline-block mx-2 transition-all",
              "md:hover:scale-150 md:hover:rotate-[360deg]",
            )}
            key={social.name}
            title={`${social.name}: ${social.username}`}
          >
            {/* @ts-expect-error it's ok */}
            {React.createElement(icons[social.icon])}
          </a>
        ))}
      </div>
    </IconContext.Provider>
  );
};
