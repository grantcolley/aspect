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
    moduleId: 1,
    name: "Administration",
    icon: "settings",
    permission: "admin_ro|admin_rw",
    isVisible: true,
    categories: [
      {
        categoryId: 1,
        name: "Authorisation",
        icon: "authorisation",
        permission: "auth_ro|auth_rw",
        isVisible: true,
        pages: [
          {
            pageId: 1,
            name: "Users",
            icon: "users",
            url: "#",
            permission: "auth_ro|auth_rw",
            isVisible: true,
          },
          {
            pageId: 2,
            name: "Roles",
            icon: "roles",
            url: "#",
            permission: "auth_ro|auth_rw",
            isVisible: true,
          },
          {
            pageId: 3,
            name: "Permissions",
            icon: "permissions",
            url: "#",
            permission: "auth_ro|auth_rw",
            isVisible: true,
          },
        ],
      },
      {
        categoryId: 2,
        name: "Applications",
        icon: "applications",
        permission: "apps_ro|apps_rw",
        isVisible: true,
        pages: [
          {
            pageId: 4,
            name: "Modules",
            icon: "modules",
            url: "#",
            permission: "apps_ro|apps_rw",
            isVisible: true,
          },
          {
            pageId: 5,
            name: "Categories",
            icon: "categories",
            url: "#",
            permission: "apps_ro|apps_rw",
            isVisible: true,
          },
          {
            pageId: 6,
            name: "Pages",
            icon: "pages",
            url: "#",
            permission: "apps_ro|apps_rw",
            isVisible: true,
          },
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
