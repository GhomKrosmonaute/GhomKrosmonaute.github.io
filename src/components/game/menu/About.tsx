import { BentoCard } from "@/components/BentoCard.tsx"
import { metadata } from "@/game-metadata.ts"
import { t } from "@/i18n"

export const About = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl text-center">{t("A propos", "About")}</h2>
      <BentoCard>
        <h3>
          Version <code>{metadata.version}</code>
        </h3>
        <p>
          {t("Code source disponible sur", "Source code available on")}{" "}
          <a
            href="https://github.com/GhomKrosmonaute/GhomKrosmonaute.github.io"
            target="_blank"
            className="font-bold hover:underline"
          >
            GitHub
          </a>
        </p>
      </BentoCard>
    </div>
  )
}
