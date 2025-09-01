import * as React from "react"

// Tiny classnames helper
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function SidebarMenu({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-1">{children}</ul>
}

export function SidebarMenuItem({ children }: { children: React.ReactNode }) {
  return <li className="list-none">{children}</li>
}

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-full cursor-pointer flex items-center text-left justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:outline-none focus-visible:ring-0", // removed default focus ring
      className
    )}
    {...props}
  />
))
SidebarMenuButton.displayName = "SidebarMenuButton"

export function SidebarMenuSub({ children }: { children: React.ReactNode }) {
  return (
    <ul
      className="ml-2 space-y-2"
      // remove any inherited focus styles
      tabIndex={-1}
    >
      {children}
    </ul>
  )
}

export function SidebarMenuSubItem({ children }: { children: React.ReactNode }) {
  return <li>{children}</li>
}
