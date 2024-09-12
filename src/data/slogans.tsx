import React from "react"

const Bold: React.FC<React.ComponentProps<"span">> = ({
  children,
  ...props
}) => (
  <span {...props} className="font-changa">
    {children}
  </span>
)

const slogans: React.ReactNode[] = [
  <>
    <span className="hidden xs:inline">Un tarif</span>
    <span className="xs:hidden">Une tarification</span> <Bold>abordable</Bold>{" "}
    <br className="xs:hidden" />
    <span className="capitalize xs:lowercase">pour</span> une qualité{" "}
    <Bold>impeccable</Bold>
  </>,
  <>
    Prestations{" "}
    <Bold>
      Web <span className="hidden xs:inline">personnalisées</span>
    </Bold>
    ,
    <br className="hidden xs:inline" /> <Bold>UX</Bold>, <Bold>UI</Bold>,{" "}
    <br className="xs:hidden" />
    <Bold>SEO</Bold> et <Bold>Game Design</Bold>
  </>,
  // <>
  //   Des <Bold>prestations web</Bold> qui vous <Bold>ressemblent</Bold>{" "}
  //   <br className="xs:hidden" />
  //   <br className="hidden xs:inline" />
  //   et qui vous <Bold>démarquent de la concurrence</Bold>
  // </>,
]

export default slogans
