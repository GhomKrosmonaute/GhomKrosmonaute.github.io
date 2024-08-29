import React from "react";

export function usePrevious<T>(value: T): T | undefined {
  const [stack, setStack] = React.useState<T[]>([]);

  React.useEffect(() => {
    if (value !== stack[1]) setStack((prev) => [prev[1], value]);
  }, [value]);

  return stack[0];
}
