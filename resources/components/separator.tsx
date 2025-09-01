// 
//
// import * as React from "react"
// import * as SeparatorPrimitive from "@radix-ui/react-separator"
//
// import { cn } from "../global/library/utils"
//
// function Separator({
//   className,
//   orientation = "horizontal",
//   decorative = true,
//   ...props
// }: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
//   return (
//     <SeparatorPrimitive.Root
//       data-slot="separator"
//       decorative={decorative}
//       orientation={orientation}
//       className={cn(
//         "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
//         className
//       )}
//       {...props}
//     />
//   )
// }
//
// export { Separator }


import * as React from "react"
import { cn } from "../global/library/utils"

type SeparatorProps = {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  role,
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? "presentation" : role || "separator"}
      aria-orientation={orientation}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px w-full" : "w-px h-full",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
