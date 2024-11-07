import { cn } from "@/utils.ts"
import React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Bold, Tag } from "@/components/game/Texts.tsx"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { tags } from "@/game-safe-utils"
import { useCardGame } from "@/hooks/useCardGame.tsx"
import { t } from "@/i18n"

const chartConfig = {
  day: {
    label: tags.day.name,
    color: "hsl(var(--day))",
  },
  energy: {
    label: tags.energy.name,
    color: "hsl(var(--energy))",
  },
  reputation: {
    label: tags.reputation.name,
    color: "hsl(var(--reputation))",
  },
  money: {
    label: tags.money.name,
    color: "hsl(var(--money))",
  },
  inflation: {
    label: tags.inflation.name,
    color: "hsl(var(--inflation))",
  },
  score: {
    label: "Score",
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig

export const GameMetricsChart = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const chartData = useCardGame((state) => state.metrics)

  return (
    <div {...props} className={cn("grid grid-cols-2 gap-5", className)}>
      <div>
        <h4 className="text-center">
          <Tag name="energy" /> {t("et", "and")} <Tag name="reputation" />
        </h4>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillEnergy" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--energy))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--energy))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillReputation" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--reputation))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--reputation))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <Area
              dataKey="reputation"
              type="natural"
              fill="url(#fillReputation)"
              fillOpacity={0.4}
              stroke="hsl(var(--reputation))"
              // stackId="a"
            />
            <Area
              dataKey="energy"
              type="natural"
              fill="url(#fillEnergy)"
              fillOpacity={0.4}
              stroke="hsl(var(--energy))"
              // stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
      <div>
        <h4 className="text-center">
          <Tag name="inflation" />, <Tag name="money" /> {t("et", "and")}{" "}
          <Bold>Score</Bold>
        </h4>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              // tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillMoney" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--money))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--money))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillInflation" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--inflation))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--inflation))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--foreground))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--foreground))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="inflation"
              type="natural"
              fill="url(#fillInflation)"
              fillOpacity={0.4}
              stroke="hsl(var(--inflation))"
              // stackId="a"
            />
            <Area
              dataKey="money"
              type="natural"
              fill="url(#fillMoney)"
              fillOpacity={0.4}
              stroke="hsl(var(--money))"
              // stackId="a"
            />
            <Area
              dataKey="score"
              type="natural"
              fill="url(#fillScore)"
              fillOpacity={0.4}
              stroke="hsl(var(--foreground))"
              // stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  )
}
