import React from "react"
import socials from "../data/socials.json"
import { accordStyleToTheme, cn } from "@/utils.ts"

import Discord from "@/assets/icons/social/discord.svg"
import Linkedin from "@/assets/icons/social/linkedin.svg"
import Github from "@/assets/icons/social/github.svg"
import { useSettings } from "@/hooks/useSettings.ts"

const icons = {
  discord: <Discord className="text-[#9A37B2]" />,
  linkedin: <Linkedin className="text-[#9A37B2]" />,
  github: <Github className="text-[#9A37B2]" />,
} as Record<string, React.ReactElement>

export const Socials = () => {
  const theme = useSettings((state) => state.theme)

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
          <div
            className="transition-all md:group-hover/social:scale-150 md:group-hover/social:rotate-[360deg] shrink-0 max-h-8 max-w-8"
            style={accordStyleToTheme(theme)}
          >
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
