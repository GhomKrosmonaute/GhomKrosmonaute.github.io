import "./GameCard.css";
import { Tilt } from "./Tilt.tsx";

export const GameCard = () => {
  return (
    <div className="game-card">
      <Tilt
        className="card without-shadow"
        options={{ reverse: true, max: 30, scale: "1.1" }}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        Test
      </Tilt>
    </div>
  );
};
