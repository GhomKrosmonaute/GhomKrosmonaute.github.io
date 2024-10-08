import React from "react"
import { useNavigate } from "react-router-dom"

import ghom from "@/data/ghom.json"
import socials from "@/data/socials.json"

import { useGlobalState } from "@/hooks/useGlobalState.ts"

import { Button } from "@/components/ui/button.tsx"
import { Modal } from "@/components/Modal.tsx"

import LinkedIn from "@/assets/icons/social/linkedin.svg"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { Textarea } from "@/components/ui/textarea.tsx"

const linkedIn = socials.find((social) => social.name === "LinkedIn")!

export const Contact = () => {
  const navigate = useNavigate()
  const [isCardGameVisible, setCardGameVisibility] = useGlobalState((state) => [
    state.isCardGameVisible,
    state.setCardGameVisibility,
  ])

  const [name, setName] = React.useState<string>("")
  const [object, setObject] = React.useState<string>("")
  const [message, setMessage] = React.useState<string>("")

  React.useEffect(() => {
    if (isCardGameVisible) setCardGameVisibility(false)
  }, [isCardGameVisible])

  return (
    <Modal modalName="/contact">
      <h1 className="text-3xl text-center md:text-left">Contact</h1>
      <div className="space-y-4 w-[90vw] xs:w-auto md:min-w-[400px] *:space-y-2 *:rounded-xl *:p-3 *:bg-card/20 *:my-2">
        <div>
          <h2 className="hidden md:block text-2xl">Envoyez moi un email</h2>
          <a
            href={`mailto:${ghom.email}`}
            target="_blank"
            className="text-lg hidden md:block"
          >
            <span className="font-zain">{ghom.email}</span>
          </a>
          <form
            className="w-full"
            onSubmit={(e) => {
              e.preventDefault()

              window.open(
                `mailto:${ghom.email}?subject=${object}&body=${message || "Bonjour Camille,"}%0D%0A%0D%0A${name || "Cordialement, [votre nom]."}`,
                "_blank",
              )
            }}
          >
            <div className="grid w-full xs:grid-cols-2 gap-4 mb-2">
              <Label className="w-full">
                Nom <span className="hidden xs:inline"> / Entreprise</span>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </Label>
              <Label>
                Objet
                <Input
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  placeholder="Collab, question..."
                />
              </Label>
            </div>
            <Label>
              Message
              <Textarea
                className="w-full h-32 p-2 border border-gray-300 rounded-md"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message plein d'amour et de bienveillance"
              />
            </Label>
            <div className="flex justify-end items-center">
              <Button
                type="submit"
                variant="cta"
                size="cta"
                className="mt-4 w-full xs:w-auto"
              >
                Envoyer
              </Button>
            </div>
          </form>
        </div>
        <div className="hidden md:block">
          <h2 className="text-2xl">Ou contactez-moi sur les réseaux</h2>
          <div className="flex flex-col gap-2">
            <a href={linkedIn.url} target="_blank">
              <span className="flex items-center gap-2 font-zain">
                <LinkedIn className="w-5" />
                LinkedIn: {linkedIn.username}
              </span>
            </a>
          </div>
        </div>
      </div>
      <div className="flex justify-end mt-4 gap-4">
        <Button
          className="hidden md:block"
          onClick={() => {
            navigate("/")
          }}
        >
          Retour
        </Button>
        <Button
          onClick={() => navigate("/pricing")}
          variant="cta"
          size="cta"
          className="hidden md:block mx-0"
        >
          Mes tarifs
        </Button>
      </div>
    </Modal>
  )
}
