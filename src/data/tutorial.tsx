import React from "react"
import { confettiFireworks } from "@/components/ui/confetti"
import { Tutorial } from "@/components/game/Tutorial.tsx"
import { TutorialStep } from "@/components/game/TutorialProvider.tsx"
import { Button } from "@/components/ui/button.tsx"
import { MONEY_TO_REACH } from "@/game-constants.ts"
import { bank } from "@/sound.ts"
import { Bold, Money, Tag } from "@/components/game/Texts.tsx"

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
          src="images/tutorial/ghom.png"
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
          <h2>
            L'
            <Tag name="energy" />
          </h2>
          <p>
            L'
            <Tag name="energy" /> est la ressource principale du jeu. <br />
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
          <h2>
            La <Tag name="reputation" />
          </h2>
          <p>Cette jauge est importante !</p>
          <p>
            Elle te permet d'utiliser des cartes lorsque tu n'as plus assez d'
            <Tag name="energy" />. <br />
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
          <h2>
            La <Tag name="day">journée</Tag>
          </h2>
          <p>
            La <Tag name="day">journée</Tag> avance à chaque carte jouée. <br />
            Certains évènements se déclencheront à la fin de chaque{" "}
            <Tag name="day" />.
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
        <h2>
          Le <Tag name="sprint" />
        </h2>
        <p>
          Le sprint est un cycle de 7 <Tag name="day" plural />, une semaine
          donc.
        </p>
        <p>
          À la fin de chaque <Tag name="sprint" />, tu pourras choisir <br />{" "}
          une <Tag name="upgrade" /> à ajouter à ton deck.
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
        <h2>Le deck</h2>
        <p>
          Comme dans la plupart des jeux de cartes, ton deck représente <br />
          toutes les cartes que tu possèdes.
        </p>
        <p>
          Ici, tu peux voir toutes les cartes de ton deck triées par <br />
          type de carte. Si tu cherches une carte en particulier, <br />
          tu peux utiliser la barre de recherche.
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
    id: "#money",
    render: ({ next, back }) => (
      <Tutorial location="right" style={cardStyle} highlight>
        <h2>
          L'
          <Tag name="money" />
        </h2>
        <p>Il te permet de jouer certaines cartes</p>
        <p>
          Si tu atteins <Money M$={MONEY_TO_REACH} />, tu gagnes la partie.
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
        <p>En haut à droite, tu peux accéder aux paramètres du jeu.</p>
        <p>
          Tu pourras y arrêter la musique, y régler la qualité graphique, <br />
          y consulter les taux de conversion et les règles du jeu <br />
          ou encore y ajuster le niveau de difficulté.
        </p>
        <p>
          On y trouve également le classement des meilleurs scores, <br />
          les cartes découvertes et les succès déverrouillés ainsi <br />
          que quelques statistiques sur tes parties précédentes. <br />
        </p>
        <p>
          Si tu as besoin d'aide, tu peux consulter le tutoriel à tout moment.
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
    id: "#card-stacks",
    render: ({ next, back }) => (
      <Tutorial location="left" style={cardStyle} highlight>
        <h2>La pioche et la défausse</h2>
        <p>A droite, tu trouveras la pioche et la défausse.</p>
        <p>
          La pioche contient les cartes que tu pourras piocher. <br />
          La défausse contient les cartes que tu viens de jouer.
        </p>
        <p>
          En cliquant sur l'une des deux piles, tu pourras voir <br />
          les cartes qu'elles contiennent.
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
        <h2>
          Les <Tag name="upgrade" plural />
        </h2>
        <p>
          Sur le haut de l'écran, tu verras apparaitre des{" "}
          <Tag name="upgrade" plural />. <br />
          Elles s'activeront automatiquement lors de certains évènements
        </p>
        <img src="images/tutorial/upgrades.png" alt="upgrades" />
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
        <img src="images/tutorial/logs.png" alt="logs" />
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
          <Button variant="cta" size="cta" onClick={next}>
            Suivant
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "_detail",
    render: ({ next, back }) => (
      <Tutorial style={cardStyle} location="center">
        <h2>Informations d'une carte</h2>
        <p>
          Si tu veux plus d'informations sur une carte, <br />
          tu peux faire un <Bold>clic droit</Bold> dessus.
        </p>
        <p>
          Une popup s'ouvrira avec les formes alternatives <br />
          de la carte et plein d'autres informations utiles !
        </p>
        <img
          src="images/tutorial/detail.png"
          alt="card detail"
          className="w-[500px]"
        />
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
          src="images/tutorial/ghom.png"
          alt="ghom face"
          className="absolute right-0 bottom-0 w-32 translate-x-1/3 translate-y-1/3"
        />
      </Tutorial>
    ),
  },
]

export default steps
