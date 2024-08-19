declare module "*.svg" {
  import React from "react";

  const content: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { className?: string }
  >;

  export default content;
}
