import fs from "fs/promises";
import { transformWithEsbuild, Plugin } from "vite";

export default function svgPlugin(): Plugin {
  return {
    name: "vite-plugin-svg",
    enforce: "pre",
    async load(id) {
      const filePath = id.replace(/[?#].*$/s, "");

      if (filePath.endsWith(".svg")) {
        const file = await fs.readFile(filePath, "utf-8");

        const transformed = `
          import React from "react"; 
          import { cn } from "@/utils.ts";
    
          export default function Svg(props: React.ComponentProps<"div">) { 
            return <div {...props} className={cn("w-full h-full aspect-square", props.className)} style={props.style}>
              ${file
                .replace(/<\?.+?>/g, "")
                .replace(/<!.+?>/g, "")
                .replace(/(\s)(width|height)=".+?px"/g, '$1$2="100%"')
                .replace(/fill="#.+?"/g, 'fill="currentColor"')

                // make camelCase attributes
                .replace(
                  /(\w+)-(\w+)=/g,
                  (_, p1, p2) => p1 + p2[0].toUpperCase() + p2.slice(1) + "=",
                )}
            </div>; 
          }
        `;

        const result = await transformWithEsbuild(transformed, id, {
          loader: "tsx",
        });

        return {
          code: result.code,
        };
      }
    },
  };
}
