
import { useAppContext } from "../../../resources/global/AppContaxt"
import { useNavigate } from "react-router-dom" 
import {
  type LucideIcon,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./sidebar"

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    currentComponent:string
    icon: LucideIcon
  }[]
}) {

   const { setCurrentComponent } = useAppContext()
  const navigate = useNavigate()

  const handleNavigate = (component: string) => {
    setCurrentComponent(component)
    navigate(`/dashboard/${component}`)
  }
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>UI Blocks</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={item.url} onClick={() => handleNavigate(item.currentComponent)}>
                <item.icon />
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
       
      </SidebarMenu>
    </SidebarGroup>
  )
}
