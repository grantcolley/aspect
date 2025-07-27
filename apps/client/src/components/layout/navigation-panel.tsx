import { Link } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import IconLoader from "@/components/icons/IconLoader";
import { Module } from "shared/src/models/module";
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

export function NavigationPanel({ modules }: Props) {
  return (
    <>
      {modules.map((module) => (
        <SidebarGroup key={module.moduleId}>
          <SidebarGroupLabel>
            <IconLoader name={module.icon} />
            <span>&nbsp;{module.name}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {module.categories.map((category) => (
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
                      {category.pages?.map((page) => (
                        <SidebarMenuSubItem key={page.pageId}>
                          <SidebarMenuSubButton asChild>
                            <Link to={page.path}>
                              <IconLoader name={page.icon} />
                              <span>{page.name}</span>
                            </Link>
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
