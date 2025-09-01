import { useEffect, useState } from "react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./collapsible"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "./sidebar-menu"
import { ChevronRight, ChevronDown } from "lucide-react"

interface DocItem {
  slug: string
  order: number
  desc: string
  children?: DocItem[]
  parentSlug?: string
}

interface SidebarProps {
  onSelect: (slug: string) => void
}

export default function SecondSidebar({ onSelect }: SidebarProps) {
  const [docs, setDocs] = useState<DocItem[]>([])
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetch("http://localhost:5001/api/docs")
      .then((res) => res.json())
      .then((data: DocItem[]) => {
        const sortTree = (items: DocItem[], parentSlug = ""): DocItem[] =>
          items
            .sort((a, b) => a.order - b.order)
            .map((item) => {
              const fullSlug = parentSlug ? `${parentSlug}/${item.slug}` : item.slug
              return {
                ...item,
                slug: fullSlug,
                children: item.children ? sortTree(item.children, fullSlug) : [],
              }
            })
        setDocs(sortTree(data))
      })
  }, [])

  const toggleOpen = (slug: string) => {
    setOpenItems((prev) => ({ ...prev, [slug]: !prev[slug] }))
  }

  const renderDocs = (items: DocItem[]) => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0
      const isOpen = openItems[item.slug] ?? false

      return (
        <Collapsible
          key={item.slug}
          open={isOpen}
          onOpenChange={() => toggleOpen(item.slug)}
          className="w-full"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                onClick={() => !hasChildren && onSelect(item.slug)}
                className="flex items-center justify-between w-full px-2 py-1.5 rounded-md hover:bg-accent hover:text-accent-foreground text-sm transition-colors"
              >
                <span>{item.desc}</span>
                {hasChildren && (
                  isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
                  )
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>

            {hasChildren && (
              <CollapsibleContent className="pl-3 mt-1 space-y-1">
                <SidebarMenuSub>{renderDocs(item.children!)}</SidebarMenuSub>
              </CollapsibleContent>
            )}
          </SidebarMenuItem>
        </Collapsible>
      )
    })
  }

  return (
    <aside className="w-64 border border-r-0 border-ring/30 overflow-y-auto h-screen p-4 bg-background">
      {/*<h3 className="text-lg font-semibold mb-3">Docs</h3>*/}
      <SidebarMenu>{renderDocs(docs)}</SidebarMenu>
    </aside>
  )
}
