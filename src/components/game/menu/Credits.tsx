import { BentoCard } from "@/components/BentoCard.tsx"

// const credits = {
//   "</> Développement": [""],
//   "🎮 Game Design": ["Camille ABELLA (Ghom)"],
//   "🖌️ Graphismes & icônes": [
//     "Camille ABELLA (Ghom)",
//     "https://react-icons.github.io/react-icons/",
//     "https://game-icons.net/",
//     "https://codepen.io/kaykay1323/pen/OJGmPxV",
//   ],
//   "🎵 Musiques": ["Camille ABELLA (Ghom)"],
//   "🔊 Sons": ["https://freesound.org/", "https://pixabay.com/"],
//   "✅ Play tests": [
//     "Mélodie Deichfischer (Mel-Andrew)",
//     "empereuronyx (\uD835\uDD7A\uD835\uDD93\uD835\uDD9E\uD835\uDD9D)",
//     "kikuchi_003 (kikuchi)",
//   ],
// }

const me = "Camille ABELLA (Ghom)"

export const Credits = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl text-center">Crédits</h2>
      <div className="grid grid-cols-12 gap-5">
        <BentoCard className="col-span-4">
          <h3>&lt;/&gt; Développement</h3>
          <p>{me}</p>
        </BentoCard>
        <BentoCard className="col-span-4">
          <h3>🎮 Game Design</h3>
          <p>{me}</p>
        </BentoCard>
        <BentoCard className="col-span-4">
          <h3>🎵 Musiques</h3>
          <p>{me}</p>
        </BentoCard>
        <BentoCard className="col-span-2">
          <h3>🔊 Sons</h3>
          <ul>
            <li>
              <a
                href="https://freesound.org/"
                className="font-bold"
                target="_blank"
              >
                freesound.org
              </a>
            </li>
            <li>
              <a
                href="https://pixabay.com/"
                className="font-bold"
                target="_blank"
              >
                pixabay.com
              </a>
            </li>
          </ul>
        </BentoCard>
        <BentoCard className="col-span-5">
          <h3>🖌️ Graphismes & icônes</h3>
          <p>
            {me}
            <br />
            For icons:{" "}
            <a
              href="https://react-icons.github.io/react-icons/"
              className="font-bold"
              target="_blank"
            >
              react-icons
            </a>{" "}
            and{" "}
            <a
              href="https://game-icons.net/"
              className="font-bold"
              target="_blank"
            >
              game-icons.net
            </a>
            <br />
            <a
              href="https://codepen.io/kaykay1323/pen/OJGmPxV"
              className="font-bold"
              target="_blank"
            >
              Kaykay's CSS god rays
            </a>{" "}
            for the background
          </p>
        </BentoCard>
        <BentoCard className="col-span-5">
          <h3>✅ Playtests</h3>
          <ul>
            <li>Mélodie Deichfischer (Mel-Andrew)</li>
            <li>empereuronyx (𝕺𝖓𝖞𝖝)</li>
            <li>kikuchi_003 (kikuchi)</li>
            <li>Xibalba</li>
            <li>threemsymbols</li>
          </ul>
        </BentoCard>
      </div>
    </div>
  )
}
