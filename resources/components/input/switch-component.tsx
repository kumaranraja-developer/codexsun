

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "../../global/library/utils"

function SwitchComponent({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative border border-foreground data-[state=checked]:bg-checked data-[state=unchecked]:bg-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-6 w-11 items-center rounded-full shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-white pointer-events-none block h-5 w-5 rounded-full ring-0 transition-transform translate-x-0 data-[state=checked]:translate-x-[1.25rem]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { SwitchComponent }
