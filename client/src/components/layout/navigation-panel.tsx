import { IconChevronRight } from "@tabler/icons-react";
import IconLoader from "@/components/icons/IconLoader";
import { Module } from "shared/src/models/module";
import type { Visibility } from "shared/src/interfaces/visibility";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type Props = {
  modules: Module[];
};

const isVisible = (visibility: Visibility) => {
  return visibility.isVisible;
};

export function NavigationPanel({ modules }: Props) {
  return (
    <>
      {modules.filter(isVisible).map((module) => (
        <SidebarGroup key={module.moduleId}>
          <SidebarGroupLabel>
            <IconLoader name={module.icon} />
            <span>&nbsp;{module.name}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {module.categories.filter(isVisible).map((category) => (
              <Collapsible
                key={category.categoryId}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={category.name}>
                      <IconLoader name={category.icon} />
                      <span>{category.name}</span>
                      <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {category.pages?.filter(isVisible).map((page) => (
                        <SidebarMenuSubItem key={page.pageId}>
                          <SidebarMenuSubButton asChild>
                            <a href={page.url}>
                              <IconLoader name={page.icon} />
                              <span>{page.name}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
