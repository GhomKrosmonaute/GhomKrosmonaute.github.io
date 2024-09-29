import { cn } from "@/utils.ts"
import { Card } from "@/components/Card.tsx"

import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx"

import { SettingsTab } from "@/components/game/settings/SettingsTab.tsx"
import { StatsTab } from "@/components/game/settings/StatsTab.tsx"
import { HelpTab } from "@/components/game/settings/HelpTab.tsx"
import { ToolsTab } from "@/components/game/settings/ToolsTab.tsx"
import { ScoresTab } from "@/components/game/settings/ScoresTab.tsx"

export const SettingsModal = (props: { show: boolean }) => {
  const toggleSettings = useGlobalState((state) => state.toggleSettings)
  const settingsCache = useSettings()

  return (
    <div
      className={cn(
        "absolute inset-0 z-30",
        "flex items-center justify-center pointer-events-none",
        {
          "transition-opacity duration-500 ease-in-out":
            settingsCache.quality.animations,
          "opacity-0 bg-background/80": settingsCache.quality.transparency,
          hidden: !settingsCache.quality.transparency,
          "opacity-100 flex pointer-events-auto": props.show,
        },
      )}
    >
      <div
        onClick={toggleSettings}
        className={cn(
          "absolute inset-0",
          props.show ? "pointer-events-auto" : "pointer-events-none",
        )}
      />

      <Card className="z-40 max-w-[1500px]">
        <Tabs defaultValue="settings">
          <TabsList className="w-full -translate-y-2">
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="scores">Scoreboard</TabsTrigger>
            <TabsTrigger value="help">Aide</TabsTrigger>
            <TabsTrigger value="tools">Outils</TabsTrigger>
          </TabsList>
          <div className="space-y-2">
            <TabsContent value="settings">
              <SettingsTab show={props.show} />
            </TabsContent>
            <TabsContent value="stats">
              <StatsTab />
            </TabsContent>
            <TabsContent value="scores">
              <ScoresTab />
            </TabsContent>
            <TabsContent value="help">
              <HelpTab />
            </TabsContent>
            <TabsContent value="tools">
              <ToolsTab />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
