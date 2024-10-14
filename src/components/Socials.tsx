import React from "react"
import socials from "../data/socials.json"
import { cn } from "@/utils.ts"

import Discord from "@/assets/icons/social/discord.svg"
import Linkedin from "@/assets/icons/social/linkedin.svg"
import Facebook from "@/assets/icons/social/facebook.svg"
import Github from "@/assets/icons/social/github.svg"
import Twitter from "@/assets/icons/social/twitter.svg"
import Instagram from "@/assets/icons/social/instagram.svg"

const icons = {
  discord: <Discord className="text-[#9A37B2]" />,
  linkedin: <Linkedin className="text-[#9A37B2]" />,
  facebook: <Facebook className="text-[#9A37B2]" />,
  github: <Github className="text-[#9A37B2]" />,
  twitter: <Twitter className="text-[#9A37B2]" />,
  instagram: <Instagram className="text-[#9A37B2]" />,
} as Record<string, React.ReactElement>

export const Socials = () => {
  return (
    <div
      className={cn(
        "grid grid-cols-3 mx-auto md:scale-100 max-w-sm md:max-w-sm",
      )}
    >
      {socials.map((social) => (
        <a
          href={social.url}
          target="_blank"
          className="flex justify-center items-center gap-2 p-2 md:m-1 md:p-3 group/social"
          key={social.name}
          title={`${social.name}: ${social.username}`}
        >
          <div className="transition-all md:group-hover/social:scale-150 md:group-hover/social:rotate-[360deg] shrink-0 max-h-8 max-w-8">
            {icons[social.icon]}
          </div>
          <div className="transition-all hidden font-changa xs:block md:group-hover/social:scale-110 md:group-hover/social:translate-x-2">
            {social.name}
          </div>
        </a>
      ))}
    </div>
  )
}
