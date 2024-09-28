import Deck from "@/assets/icons/game/deck.svg"
import Draw from "@/assets/icons/game/draw.svg"
import Discard from "@/assets/icons/game/discard.svg"
import { Stat } from "@/components/game/GameStats.tsx"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { getDeck } from "@/game-safe-utils.tsx"

export const CollectionCounter = (props: {
  collection: "deck" | "draw" | "discard"
}) => {
  const game = useCardGame((state) => ({
    deck: getDeck(state),
    draw: state.draw,
    discard: state.discard,
    hand: state.hand,
  }))

  return (
    <Stat
      Icon={
        props.collection === "deck"
          ? Deck
          : props.collection === "draw"
            ? Draw
            : Discard
      }
      name={
        props.collection === "deck"
          ? "Deck"
          : props.collection === "draw"
            ? "Pioche"
            : "Défausse"
      }
      value={game[props.collection].length}
      className="h-5"
    />
  )
}
