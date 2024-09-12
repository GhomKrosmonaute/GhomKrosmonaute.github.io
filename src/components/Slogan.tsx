import React from "react"

import slogans from "@/data/slogans"

export const Slogan = () => {
  const [index, setIndex] = React.useState(0)

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index) => (index + 1) % slogans.length)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full">
      <p className="w-fit whitespace-nowrap xs:tracking-wider md:tracking-[0.15rem] mx-auto mt-2 text-left md:text-center md:text-2xl">
        {slogans[index]}
      </p>
    </div>
  )
}
