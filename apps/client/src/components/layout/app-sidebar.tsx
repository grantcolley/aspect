import * as React from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { IconWorld } from "@tabler/icons-react";
import { NavigationPanel } from "@/components/layout/navigation-panel";
import { Module } from "shared/src/models/module";
import { config } from "@/config/config";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  const navigationUrl = `${config.API_URL}/${config.API_NAVIGATION_URL}`;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const fetchModules = async () => {
      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(navigationUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Module[] = await response.json();

        setModules(data);
      } catch (err) {
        setError("Failed to fetch modules");
        console.error(err);
      }
    };

    fetchModules();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (!isAuthenticated) return <></>;
  if (error) return <p>{error}</p>;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <IconWorld className="!size-5" />
                <span className="text-base font-semibold">Aspect</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavigationPanel modules={modules}></NavigationPanel>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
