import React from "react"

export const useLazyImport = <T>(
  importFn: () => Promise<{ default: T }>,
): T | undefined => {
  const [state, setState] = React.useState<T | undefined>(undefined)

  React.useEffect(() => {
    importFn().then((m) => setState(m.default))
  }, [importFn])

  return state
}
