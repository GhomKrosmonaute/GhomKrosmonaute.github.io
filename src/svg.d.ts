declare module "*.svg" {
  import React from "react";

  const content: React.FunctionComponent<React.ComponentProps<"div">>;

  export default content;
}
