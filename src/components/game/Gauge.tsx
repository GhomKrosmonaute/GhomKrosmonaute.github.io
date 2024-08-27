import { Progress } from "@/components/ui/progress.tsx";
import { ValueIcon } from "@/components/game/ValueIcon.tsx";

export const Gauge = (props: {
  type: "energy" | "reputation";
  className?: string;
  value: number;
  max: number;
  iconScale?: number | string;
  textColor?: string;
  barColor?: string;
}) => {
  return (
    <div className="flex items-center h-7 w-full">
      <ValueIcon
        type={props.type}
        value={props.value}
        iconScale={props.iconScale}
        textColor={props.textColor}
        className="absolute -translate-x-1/2 z-50 scale-50"
      />
      <Progress
        barColor={props.barColor}
        className={props.className}
        value={(props.value / props.max) * 100}
      />
    </div>
  );
};
