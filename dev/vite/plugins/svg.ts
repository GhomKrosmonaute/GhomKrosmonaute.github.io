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
    
          export default function Svg({ className, style }: { className?: string, style?: React.CSSProperties }) { 
            return <div className={cn("w-full h-full aspect-square text-foreground", className)} style={style}>
              ${file
                .replace(/<\?.+?>/g, "")
                .replace(/<!.+?>/g, "")
                .replace(/(\s)(width|height)=".+?"/g, '$1$2="100%"')
                .replace(/fill="#.+?"/g, 'fill="currentColor"')}
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
