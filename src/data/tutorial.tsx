import React from "react";
import { Tutorial } from "@/components/game/Tutorial.tsx";
import { TutorialStep } from "@/components/game/TutorialProvider.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MONEY_TO_REACH } from "@/game-constants.ts";

const cardStyle: React.CSSProperties = {
  backgroundColor: "hsl(var(--card))",
  padding: "1rem",
  borderRadius: "0.5rem",
  boxShadow: "0 0 4rem 0 rgba(255,255,255, 0.3)",
};

const steps: TutorialStep[] = [
  {
    id: "_welcome",
    render: ({ next, finish }) => (
      <Tutorial
        style={{
          position: "fixed",
          overflow: "visible",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)", // centering element
          ...cardStyle,
        }}
      >
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
    render: ({ next }) => (
      <>
        <Tutorial location="right" onClick={next} style={cardStyle} highlight>
          <h2>L'énergie</h2>
          <p>
            L'énergie est la ressource principale du jeu. <br />
            Elle te permet de jouer des cartes.
          </p>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </Tutorial>
      </>
    ),
  },
  {
    id: "#reputation",
    render: ({ next }) => (
      <>
        <Tutorial location="right" onClick={next} style={cardStyle} highlight>
          <h2>La réputation</h2>
          <p>Cette jauge est importante !</p>
          <p>
            Elle te permet d'utiliser des cartes lorsque tu n'as plus assez
            d'énergie. <br />
            Cependant, si cette gauge est vide, tu perds la partie.
          </p>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </Tutorial>
      </>
    ),
  },
  {
    id: "#day",
    render: ({ next }) => {
      return (
        <Tutorial location="right" onClick={next} style={cardStyle} highlight>
          <h2>La journée</h2>
          <p>
            La journée avance à chaque carte jouée. <br />
            Certains évènement se déclencheront à la fin de la journée.
          </p>
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </Tutorial>
      );
    },
  },
  {
    id: "#sprint",
    render: ({ next }) => (
      <Tutorial location="right" onClick={next} style={cardStyle} highlight>
        <h2>Le sprint</h2>
        <p>Le sprint est un cycle de 7 jours.</p>
        <p>
          À la fin de chaque sprint, tu pourras choisir <br /> une amélioration
          à ajouter à ton deck.
        </p>
        <Button variant="cta" size="cta" onClick={next}>
          Suivant
        </Button>
      </Tutorial>
    ),
  },
  {
    id: "#deck",
    render: ({ next }) => (
      <Tutorial location="right" onClick={next} style={cardStyle} highlight>
        <h2>Le deck, la pioche et la défausse</h2>
        <p>
          Comme dans la plupart des jeux de carte, ton deck représente <br />
          toutes les cartes que tu possèdes.
        </p>
        <p>
          Ta pioche est la pile de cartes que tu vas piocher, et la défausse{" "}
          <br />
          est la pile de cartes que tu as déjà jouées.
        </p>
        <p>Ici, tu peux voir la composition de chaque pile de façon triée.</p>
        <Button variant="cta" size="cta" onClick={next}>
          Suivant
        </Button>
      </Tutorial>
    ),
  },
  {
    id: "#money",
    render: ({ next }) => (
      <Tutorial location="right" onClick={next} style={cardStyle} highlight>
        <h2>L'argent</h2>
        <p>
          L'argent est une ressource secondaire. <br />
          Il te permet d'acheter des cartes au marché ou <br />
          de jouer des cartes.
        </p>
        <p>Si tu atteins les {MONEY_TO_REACH}M$, tu gagnes la partie.</p>
        <Button variant="cta" size="cta" onClick={next}>
          Suivant
        </Button>
      </Tutorial>
    ),
  },
  {
    id: "#corner-icons",
    render: ({ next }) => (
      <Tutorial
        location="left"
        onClick={next}
        style={{
          ...cardStyle,
          transform: "translate(-50%, 0)",
        }}
        highlight
      >
        <h2>Les paramètres</h2>
        <p>
          En haut à droite, tu peux accéder aux paramètres du jeu. <br />
          Tu pourras y arrêter la musique, y régler la qualité graphique, <br />
          y consulter les taux de conversion et les règles du jeu <br />
          ou encore y ajuster le niveau de difficulté.
        </p>
        <Button variant="cta" size="cta" onClick={next}>
          Suivant
        </Button>
      </Tutorial>
    ),
  },
];

export default steps;
