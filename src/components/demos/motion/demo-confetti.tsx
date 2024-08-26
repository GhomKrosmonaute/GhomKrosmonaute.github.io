import { Button } from "@/components/ui/button";
import {
  confettiBasic,
  confettiCustomShapes,
  confettiEmojis,
  confettiFireworks,
  confettiRandom,
  confettiSideCannons,
  confettiStars,
} from "@/components/ui/confetti";
import { FlexWrap } from "@/components/ui/containers";

export default function DemoConfetti() {
  return (
    <FlexWrap className="relative justify-center max-w-[500px]">
      {CONFETTI.map((confetti, index) => (
        <Button key={index} onClick={confetti.handler} variant="outline">
          {confetti.label}
        </Button>
      ))}
    </FlexWrap>
  );
}

/*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
/*                        CONSTANTS                           */
/*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/

const CONFETTI = [
  { handler: confettiBasic, label: "Confetti 🥳" },
  { handler: confettiRandom, label: "Random 🥳" },
  { handler: confettiFireworks, label: "Fireworks 🥳" },
  { handler: confettiSideCannons, label: "Side Cannons 🥳" },
  { handler: confettiStars, label: "Stars 🥳" },
  { handler: confettiCustomShapes, label: "Custom Shapes 🥳" },
  { handler: confettiEmojis, label: "Emojis 🥳" },
];
