import React from "react";
import socials from "../data/socials.json";
import { cn } from "@/utils.ts";

import Discord from "@/assets/icons/social/discord.svg";
import Linkedin from "@/assets/icons/social/linkedin.svg";
import Facebook from "@/assets/icons/social/facebook.svg";
import Github from "@/assets/icons/social/github.svg";
import Twitter from "@/assets/icons/social/twitter.svg";
import Instagram from "@/assets/icons/social/instagram.svg";

const icons = {
  // @ts-expect-error it's fine
  discord: <Discord className="text-[#9A37B2]" />,
  // @ts-expect-error it's fine
  linkedin: <Linkedin className="text-[#9A37B2]" />,
  // @ts-expect-error it's fine
  facebook: <Facebook className="text-[#9A37B2]" />,
  // @ts-expect-error it's fine
  github: <Github className="text-[#9A37B2]" />,
  // @ts-expect-error it's fine
  twitter: <Twitter className="text-[#9A37B2]" />,
  // @ts-expect-error it's fine
  instagram: <Instagram className="text-[#9A37B2]" />,
} as Record<string, React.ReactElement>;

export const Socials = () => {
  return (
    <div
      className={cn(
        "grid grid-cols-6 mx-auto md:scale-100 max-w-sm md:max-w-sm",
      )}
    >
      {socials.map((social) => (
        <a
          href={social.url}
          target="_blank"
          className={cn(
            "flex justify-center items-center p-3 mx-2 transition-all",
            "md:hover:scale-150 md:hover:rotate-[360deg]",
          )}
          key={social.name}
          title={`${social.name}: ${social.username}`}
        >
          {icons[social.icon]}
        </a>
      ))}
    </div>
  );
};
