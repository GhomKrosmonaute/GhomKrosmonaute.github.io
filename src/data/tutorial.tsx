import { Bold, Money, Tag } from "@/components/game/Texts.tsx"
import { Tutorial } from "@/components/game/Tutorial.tsx"
import { TutorialStep } from "@/components/game/TutorialProvider.tsx"
import { Button } from "@/components/ui/button.tsx"
import { confettiFireworks } from "@/components/ui/confetti"
import { MONEY_TO_REACH } from "@/game-constants.ts"
import { t } from "@/i18n"
import { bank } from "@/sound.ts"
import React from "react"

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
        <h2>
          {t("Bienvenue sur mon jeu de cartes !", "Welcome to my card game!")}
        </h2>
        <p>
          {t(
            <>
              Je vais te guider rapidement à travers les bases du jeu. <br />
              J'espère qu'il te plaira !
            </>,
            <>
              I'll guide you through the basics of the game. <br />I hope you
              enjoy it!
            </>,
          )}
        </p>
        <div className="flex gap-2">
          <Button onClick={finish}>
            {t("Quitter le tutoriel", "Quit the tutorial")}
          </Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("C'est parti !", "Let's go!")}
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
          {t(
            <>
              <h2>
                L'
                <Tag name="energy" />
              </h2>
              <p>
                L'
                <Tag name="energy" /> est la ressource principale du jeu. <br />
                Elle te permet de jouer des cartes.
              </p>
            </>,
            <>
              <h2>
                The <Tag name="energy" />
              </h2>
              <p>
                The <Tag name="energy" /> is the main resource of the game.{" "}
                <br />
                It allows you to play cards.
              </p>
            </>,
          )}

          <div className="flex gap-2">
            <Button onClick={back}>{t("Retour", "Back")}</Button>
            <Button variant="cta" size="cta" onClick={next}>
              {t("Suivant", "Next")}
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
            {t("La", "The")} <Tag name="reputation" />
          </h2>
          {t(
            <>
              <p>Cette jauge est importante !</p>
              <p>
                Elle te permet d'utiliser des cartes lorsque tu n'as plus assez
                d'
                <Tag name="energy" />. <br />
                Cependant, si cette jauge est vide, tu perds la partie.
              </p>
            </>,
            <>
              <p>This is important!</p>
              <p>
                It allows you to use cards when you don't have enough{" "}
                <Tag name="energy" />. <br />
                However, if this meter is empty, you lose the game.
              </p>
            </>,
          )}

          <div className="flex gap-2">
            <Button onClick={back}>{t("Retour", "Back")}</Button>
            <Button variant="cta" size="cta" onClick={next}>
              {t("Suivant", "Next")}
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
          {t(
            <>
              <h2>
                La <Tag name="day">journée</Tag>
              </h2>
              <p>
                La <Tag name="day">journée</Tag> avance à chaque carte jouée.{" "}
                <br />
                Certains évènements se déclencheront à la fin de chaque{" "}
                <Tag name="day" />.
              </p>
            </>,
            <>
              <h2>
                The <Tag name="day" />
              </h2>
              <p>
                The time advances every time a card is played. <br />
                Some events will trigger at the end of each <Tag name="day" />.
              </p>
            </>,
          )}

          <div className="flex gap-2">
            <Button onClick={back}>{t("Retour", "Back")}</Button>
            <Button variant="cta" size="cta" onClick={next}>
              {t("Suivant", "Next")}
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
          {t("Le", "The")} <Tag name="sprint" />
        </h2>
        {t(
          <>
            <p>
              Le sprint est un cycle de 7 <Tag name="day" plural />, une semaine
              donc.
            </p>
            <p>
              À la fin de chaque <Tag name="sprint" />, tu pourras choisir{" "}
              <br /> une <Tag name="upgrade" /> à ajouter à ton deck.
            </p>
          </>,
          <>
            <p>
              The sprint is a 7 <Tag name="day" plural /> cycle, so a week.
            </p>
            <p>
              At the end of each <Tag name="sprint" />, you can choose <br /> an{" "}
              <Tag name="upgrade" /> to add to your deck.
            </p>
          </>,
        )}

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#deck",
    render: ({ next, back }) => (
      <Tutorial location="right" style={cardStyle} highlight>
        {t(
          <>
            <h2>Le deck</h2>
            <p>
              Comme dans la plupart des jeux de cartes, ton deck représente{" "}
              <br />
              toutes les cartes que tu possèdes.
            </p>
            <p>
              Ici, tu peux voir toutes les cartes de ton deck triées par <br />
              type de carte. Si tu cherches une carte en particulier, <br />
              tu peux utiliser la barre de recherche.
            </p>
          </>,
          <>
            <h2>Deck</h2>
            <p>
              As in most card games, your deck represents <br />
              all the cards you own.
            </p>
            <p>
              Here, you can see all the cards in your deck sorted by <br />
              card type. If you are looking for a specific card, <br />
              you can use the search bar.
            </p>
          </>,
        )}

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
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
          {t("L'", "The")} <Tag name="money" />
        </h2>
        <p>
          {t(
            "Il te permet de jouer certaines cartes",
            "It allows you to play certain cards",
          )}
        </p>
        <p>
          {t("Si tu atteins", "If you reach")} <Money M$={MONEY_TO_REACH} />,{" "}
          {t("tu gagnes la partie.", "you win the game.")}
        </p>

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#corner-icons",
    render: ({ next, back }) => (
      <Tutorial location="left" style={cardStyle} highlight>
        {t(
          <>
            <h2>Les paramètres</h2>
            <p>En haut à droite, tu peux accéder aux paramètres du jeu.</p>
            <p>
              Tu pourras y arrêter la musique, y régler la qualité graphique,{" "}
              <br />
              y consulter les taux de conversion et les règles du jeu <br />
              ou encore y ajuster le niveau de difficulté.
            </p>
            <p>
              On y trouve également le classement des meilleurs scores, <br />
              les cartes découvertes et les succès déverrouillés ainsi <br />
              que quelques statistiques sur tes parties précédentes. <br />
            </p>
            <p>
              Si tu as besoin d'aide, tu peux consulter le tutoriel à tout
              moment.
            </p>
          </>,
          <>
            <h2>The Settings</h2>
            <p>At the top right, you can access the game settings.</p>
            <p>
              You can stop the music, adjust the graphic quality, <br />
              check the conversion rates and the game rules <br />
              or adjust the difficulty level.
            </p>
            <p>
              You will also find the leaderboard, <br />
              the discovered cards and unlocked achievements as well <br />
              as some statistics on your previous games. <br />
            </p>
            <p>If you need help, you can consult the tutorial at any time.</p>
          </>,
        )}

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#hand",
    render: ({ next, back }) => (
      <Tutorial location="top" style={cardStyle} highlight>
        <h2>{t("La main", "The Hand")}</h2>
        <p>
          {t(
            <>
              Ta main est l'ensemble des cartes que tu peux jouer. <br />
              Tu peux en jouer tant que tu as les ressources nécessaires <br />
              et que leurs effets sont activables.
            </>,
            <>
              Your hand is the set of cards you can play. <br />
              You can play them as long as you have the necessary resources{" "}
              <br />
              and their effects are activatable.
            </>,
          )}
        </p>

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#card-stacks",
    render: ({ next, back }) => (
      <Tutorial location="left" style={cardStyle} highlight>
        <h2>
          {t("La pioche et la défausse", "The draw pile and the discard pile")}
        </h2>
        <p>
          {t(
            "A droite, tu trouveras la pioche et la défausse.",
            "On the right, you will find the draw pile and the discard pile.",
          )}
        </p>
        <p>
          {t(
            <>
              La pioche contient les cartes que tu pourras piocher. <br />
              La défausse contient les cartes que tu viens de jouer.
            </>,
            <>
              The draw pile contains the cards you can draw. <br />
              The discard pile contains the cards you have just played.
            </>,
          )}
        </p>
        <p>
          {t(
            <>
              En cliquant sur l'une des deux piles, tu pourras voir <br />
              les cartes qu'elles contiennent.
            </>,
            <>
              By clicking on one of the two piles, you can see <br />
              the cards they contain.
            </>,
          )}
        </p>

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
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
          {t("Les", "The")} <Tag name="upgrade" plural />
        </h2>
        <p>
          {t(
            <>
              Sur le haut de l'écran, tu verras apparaitre des{" "}
              <Tag name="upgrade" plural />. <br />
              Elles s'activeront automatiquement lors de certains évènements
            </>,
            <>
              At the top of the screen, you will see{" "}
              <Tag name="upgrade" plural /> appear. <br />
              They will activate automatically during certain events
            </>,
          )}
        </p>

        <img src="images/tutorial/upgrades.png" alt="upgrades" />
        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#logs",
    render: ({ next, back }) => (
      <Tutorial location="right" style={cardStyle} highlight>
        {t(
          <>
            <h2>Les logs</h2>
            <p>
              Ici, tu pourras voir les effets des cartes que tu as jouées.{" "}
              <br />
              Les logs sont triés par ordre chronologique. <br />
              Tu peux scroll dedans avec la molette de la souris.
            </p>
          </>,
          <>
            <h2>Logs</h2>
            <p>
              Here, you can see the effects of the cards you have played. <br />
              The logs are sorted by chronological order. <br />
              You can scroll it with the mouse wheel.
            </p>
          </>,
        )}

        <img src="images/tutorial/logs.png" alt="logs" />
        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "#actions",
    render: ({ next, back }) => (
      <Tutorial location="top" style={cardStyle} highlight>
        {t(
          <>
            <h2>Les actions</h2>
            <p>
              Au milieu de l'écran, tu trouveras des actions <br />a effectuer
              au cours de la partie.
            </p>
            <p>
              Par exemple, choisir une carte à ajouter à ton deck <br />
              ou même piocher une carte si tu ne peux pas jouer
            </p>
          </>,
          <>
            <h2>Actions</h2>
            <p>
              In the middle of the screen, you will find actions <br />
              to perform during the game.
            </p>
            <p>
              For example, choose a card to add to your deck <br />
              or even draw a card if you cannot play
            </p>
          </>,
        )}

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button variant="cta" size="cta" onClick={next}>
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "_detail",
    render: ({ next, back }) => (
      <Tutorial style={cardStyle} location="center">
        {t(
          <>
            <h2>Informations d'une carte</h2>
            <p>
              Si tu veux plus d'informations sur une carte, <br />
              tu peux faire un <Bold>clic droit</Bold> dessus.
            </p>
            <p>
              Une popup s'ouvrira avec les formes alternatives <br />
              de la carte et plein d'autres informations utiles !
            </p>
          </>,
          <>
            <h2>Card details</h2>
            <p>
              If you want more information about a card, <br />
              you can <Bold>right-click</Bold> on it.
            </p>
            <p>
              A popup will open with alternative forms <br />
              of the card and many other useful details!
            </p>
          </>,
        )}

        <img
          src="images/tutorial/detail.png"
          alt="card detail"
          className="w-[500px]"
        />

        <div className="flex gap-2">
          <Button onClick={back}>{t("Retour", "Back")}</Button>
          <Button
            variant="cta"
            size="cta"
            onClick={() => {
              bank.victory.play()
              confettiFireworks()
              next()
            }}
          >
            {t("Suivant", "Next")}
          </Button>
        </div>
      </Tutorial>
    ),
  },
  {
    id: "_end",
    render: ({ finish }) => (
      <Tutorial style={cardStyle} location="center">
        {t(
          <>
            <h2>Fin du tutoriel</h2>
            <p>
              Tu as maintenant toutes les clés en main. <br />
              N'hésite pas à consulter les règles du jeu si tu as besoin d'aide.
            </p>
          </>,
          <>
            <h2>End of the tutorial</h2>
            <p>
              You now have all the keys in hand. <br />
              Feel free to consult the game rules if you need help.
            </p>
          </>,
        )}

        <div className="flex gap-2">
          <Button variant="cta" size="cta" onClick={finish}>
            {t("Lancer une partie", "Play!")}
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
