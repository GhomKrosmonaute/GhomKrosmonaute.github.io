import { metadata } from "@/game-metadata.ts"
import { BentoCard } from "@/components/BentoCard.tsx"

export const About = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl text-center">A propos</h2>
      <BentoCard>
        <h3>
          Version <code>{metadata.version}</code>
        </h3>
        <p>
          Code source disponible sur{" "}
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
