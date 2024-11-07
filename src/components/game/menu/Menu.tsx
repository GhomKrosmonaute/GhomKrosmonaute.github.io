import { Card } from "@/components/Card.tsx"
import { cn } from "@/utils.ts"

import { useGlobalState } from "@/hooks/useGlobalState.ts"
import { useSettings } from "@/hooks/useSettings.ts"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.tsx"

import { About } from "@/components/game/menu/About.tsx"
import { Credits } from "@/components/game/menu/Credits.tsx"
import { GameTools } from "@/components/game/menu/GameTools.tsx"
import { Helpers } from "@/components/game/menu/Helpers.tsx"
import { Scoreboard } from "@/components/game/menu/Scoreboard.tsx"
import { Settings } from "@/components/game/menu/Settings.tsx"
import { Statistics } from "@/components/game/menu/Statistics.tsx"
import { t } from "@/i18n"

export const Menu = (props: { show: boolean }) => {
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
            <TabsTrigger value="settings">
              {t("Paramètres", "Settings")}
            </TabsTrigger>
            <TabsTrigger value="stats">
              {t("Statistiques", "Statistics")}
            </TabsTrigger>
            <TabsTrigger value="scores">
              {t("Classement", "Scoreboard")}
            </TabsTrigger>
            <TabsTrigger value="help">{t("Aide", "Helpers")}</TabsTrigger>
            <TabsTrigger value="tools">{t("Outils", "Game Tools")}</TabsTrigger>
            <TabsTrigger value="about">{t("À propos", "About")}</TabsTrigger>
            <TabsTrigger value="credits">{t("Crédits", "Credits")}</TabsTrigger>
          </TabsList>
          <div className={cn("space-y-2", props.show ? "block" : "hidden")}>
            <TabsContent value="settings">
              <Settings show={props.show} />
            </TabsContent>
            <TabsContent value="stats">
              <Statistics />
            </TabsContent>
            <TabsContent value="scores">
              <Scoreboard />
            </TabsContent>
            <TabsContent value="help">
              <Helpers />
            </TabsContent>
            <TabsContent value="tools">
              <GameTools />
            </TabsContent>
            <TabsContent value="about">
              <About />
            </TabsContent>
            <TabsContent value="credits">
              <Credits />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  )
}
