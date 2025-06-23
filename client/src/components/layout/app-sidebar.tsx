import * as React from "react";
import { IconWorld } from "@tabler/icons-react";
import { NavigationPanel } from "@/components/layout/navigation-panel";
import { Module } from "shared/src/models/module";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = [
  {
    id: 1,
    name: "Administration",
    icon: "settings",
    isVisible: true,
    categories: [
      {
        name: "Authorisation",
        icon: "authorisation",
        isVisible: true,
        pages: [
          { name: "Users", icon: "users", url: "#", isVisible: true },
          { name: "Roles", icon: "roles", url: "#", isVisible: true },
          {
            name: "Permissions",
            icon: "permissions",
            url: "#",
            isVisible: true,
          },
        ],
      },
      {
        name: "Applications",
        icon: "applications",
        isVisible: true,
        pages: [
          { name: "Modules", icon: "modules", url: "#", isVisible: true },
          { name: "Categories", icon: "categories", url: "#", isVisible: true },
          { name: "Pages", icon: "pages", url: "#", isVisible: true },
        ],
      },
    ],
  },
] as Module[];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconWorld className="!size-5" />
                <span className="text-base font-semibold">Aspect</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavigationPanel modules={data}></NavigationPanel>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
