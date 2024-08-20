import { Progress } from "@/components/ui/progress.tsx";
import { ValueIcon } from "@/components/game/ValueIcon.tsx";

export const Gauge = (props: {
  name: string;
  image: string;
  className?: string;
  value: number;
  max: number;
}) => {
  return (
    <div className="flex items-center">
      <ValueIcon
        name={props.name}
        image={props.image}
        value={props.value}
        className="translate-x-1/2 z-50"
      />
      <Progress
        className={props.className}
        value={(props.value / props.max) * 100}
      />
    </div>
  );
};
