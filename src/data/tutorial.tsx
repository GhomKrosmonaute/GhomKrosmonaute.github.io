import React from "react"
import { confettiFireworks } from "@/components/ui/confetti"
import { Tutorial } from "@/components/game/Tutorial.tsx"
import { TutorialStep } from "@/components/game/TutorialProvider.tsx"
import { Button } from "@/components/ui/button.tsx"
import { MONEY_TO_REACH } from "@/game-constants.ts"
import { bank } from "@/sound.ts"
import { formatText } from "@/game-safe-utils.ts"

const cardStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card))",
  padding: "1rem",
  borderRadius: "0.5rem",
  boxShadow: "0 0 4rem 0 rgba(255,255,255, 0.3)",
}

const steps: TutorialStep[] = [
  {
    id: "_welcome",
    render: ({ next, finish }) => (
      <Tutorial style={cardStyle} location="center">
        <h2>Bienvenue sur mon jeu de cartes !</h2>
        <p>
          Je vais te guider rapidement à travers les bases du jeu. <br />
          J'espère qu'il te plaira !
        </p>
        <div className="flex gap-2">
          <Button onClick={finish}>Quitter le tutoriel</Button>
          <Button variant="cta" size="cta" onClick={next}>
            C'est parti !
          </Button>
        </div>
        <img
          src="images/ghom.png"
          alt="ghom face"
          className="absolute right-0 bottom-0 w-32 translate-x-1/3 translate-y-1/3"
        />
      </Tutorial>
    ),
  },
  {
    id: "#energy",
    render: ({ next, back }) => (
      <>
        <Tutorial location="right" style={cardStyle} highlight>
          <h2>L'énergie</h2>
          <p>
            L'énergie est la ressource principale du jeu. <br />
            Elle te permet de jouer des cartes.
          </p>
          <div className="flex gap-2">
            <Button onClick={back}>Retour</Button>
            <Button variant="cta" size="cta" onClick={next}>
              Suivant
            </Button>
          </div>
        </Tutorial>
      </>
    ),
  },
  {
    id: "#reputation",
    render: ({ next, back }) => (
      <>
        <Tutorial location="right" style={cardStyle} highlight>
          <h2>La réputation</h2>
          <p>Cette jauge est importante !</p>
          <p>
            Elle te permet d'utiliser des cartes lorsque tu n'as plus assez
            d'énergie. <br />
            Cependant, si cette jauge est vide, tu perds la partie.
          </p>
          <div className="flex gap-2">
            <Button onClick={back}>Retour</Button>
            <Button variant="cta" size="cta" onClick={next}>
              Suivant
            </Button>
          </div>
        </Tutorial>
      </>
    ),
  },
  {
    id: "#day",
    render: ({ next, back }) => {
      return (
        <Tutorial location="right" style={cardStyle} highlight>
          <h2>La journée</h2>
          <p>
            La journée avance à chaque carte jouée. <br />
            Certains évènements se déclencheront à la fin de la journée.
          </p>
          <div className="flex gap-2">
            <Button onClick={back}>Retour</Button>
            <Button variant="cta" size="cta" onClick={next}>
              Suivant
            </Button>
          </div>
        </Tutorial>
      )
    },
  },
  {
    id: "#sprint",
    render: ({ next, back }) => (
      <Tutorial location="right" style={cardStyle} highlight>
        <h2>Le sprint</h2>
        <p>Le sprint est un cycle de 7 jours.</p>
        <p>
          À la fin de chaque sprint, tu pourras choisir <br /> une amélioration
          à ajouter à ton deck.
        </p>
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#deck",
    render: ({ next, back }) => (
      <Tutorial location="right" style={cardStyle} highlight>
        <h2>Le deck, la pioche et la défausse</h2>
        <p>
          Comme dans la plupart des jeux de cartes, ton deck représente <br />
          toutes les cartes que tu possèdes.
        </p>
        <p>
          Ta pioche est la pile de cartes que tu vas piocher, et la défausse{" "}
          <br />
          est la pile de cartes que tu as déjà jouées.
        </p>
        <p>Ici, tu peux voir la composition de chaque pile de façon triée.</p>
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#money",
    render: ({ next, back }) => (
      <Tutorial location="right" style={cardStyle} highlight>
        <h2>L'argent</h2>
        <p>
          L'argent est une ressource secondaire. <br />
          Il te permet d'acheter des cartes au marché ou <br />
          de jouer des cartes.
        </p>
        <p>
          Si tu atteins les{" "}
          <span
            dangerouslySetInnerHTML={{
              __html: formatText(`${MONEY_TO_REACH}M$`),
            }}
          />
          , tu gagnes la partie.
        </p>
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#corner-icons",
    render: ({ next, back }) => (
      <Tutorial location="left" style={cardStyle} highlight>
        <h2>Les paramètres</h2>
        <p>
          En haut à droite, tu peux accéder aux paramètres du jeu. <br />
          Tu pourras y arrêter la musique, y régler la qualité graphique, <br />
          y consulter les taux de conversion et les règles du jeu <br />
          ou encore y ajuster le niveau de difficulté.
        </p>
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#hand",
    render: ({ next, back }) => (
      <Tutorial location="top" style={cardStyle} highlight>
        <h2>La main</h2>
        <p>
          Ta main est l'ensemble des cartes que tu peux jouer. <br />
          Tu peux en jouer tant que tu as les ressources nécessaires <br />
          et que leurs effets sont activables.
        </p>
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#upgrades",
    render: ({ next, back }) => (
      <Tutorial location="bottom" style={cardStyle} highlight>
        <h2>Les améliorations</h2>
        <p>
          Sur le haut de l'écran, tu verras apparaitre des améliorations. <br />
          Elles s'activeront automatiquement en fonction de certaines
          conditions.
        </p>
        <img src="images/upgrades.png" alt="upgrades" />
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#logs",
    render: ({ next, back }) => (
      <Tutorial location="right" style={cardStyle} highlight>
        <h2>Les logs</h2>
        <p>
          Ici, tu pourras voir les effets des cartes que tu as jouées. <br />
          Les logs sont triés par ordre chronologique.
        </p>
        <img src="images/logs.png" alt="logs" />
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#actions",
    render: ({ next, back }) => (
      <Tutorial location="top" style={cardStyle} highlight>
        <h2>Les actions</h2>
        <p>
          Au milieu de l'écran, tu trouveras des actions <br />a effectuer au
          cours de la partie.
        </p>
        <p>
          Par exemple, choisir une carte à ajouter à ton deck <br />
          ou même piocher une carte si tu ne peux pas jouer
        </p>
        <div className="flex gap-2">
          <Button onClick={back}>Retour</Button>
          <Button
            variant="cta"
            size="cta"
            onClick={() => {
              bank.victory.play()
              confettiFireworks()
              next()
            }}
          >
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "_end",
    render: ({ finish }) => (
      <Tutorial style={cardStyle} location="center">
        <h2>Fin du tutoriel</h2>
        <p>
          Tu as maintenant toutes les clés en main. <br />
          N'hésite pas à consulter les règles du jeu si tu as besoin d'aide.
        </p>
        <div className="flex gap-2">
          <Button variant="cta" size="cta" onClick={finish}>
            Lancer une partie
          </Button>
        </div>
        <img
          src="images/ghom.png"
          alt="ghom face"
          className="absolute right-0 bottom-0 w-32 translate-x-1/3 translate-y-1/3"
        />
      </Tutorial>
    ),
  },
]

export default steps
