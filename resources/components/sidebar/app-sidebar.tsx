// import { useSettings } from "@/hooks/useSettings"
// import { iconMap } from "@/utils/iconMap"
import { iconMap } from "../common/icon-map"
import { NavUser } from "./nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarSeparator } from "./sidebar"
import { NavMain } from "./nav-main"
import { useAppSettings } from "../../../resources/global/useSettings"
import React from "react"

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const settings = useAppSettings()
  
  if (!settings) return null

  const navMain = settings.sidemenu.main.map((item: any) => ({
    ...item,
    icon: iconMap[item.icon] || undefined,
    items: item.items?.map((sub: any) => ({ ...sub })),
  }))

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarSeparator className="p-0 m-0"/>
      <SidebarFooter>
        <NavUser user={settings.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
