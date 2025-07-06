import * as React from "react";
import { useEffect, useState } from "react";
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigationUrl = `${import.meta.env.VITE_REACT_API_URL}/${
    import.meta.env.VITE_REACT_API_NAVIGATION_URL
  }`;

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(navigationUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Module[] = await response.json();

        setModules(data);
      } catch (err) {
        setError("Failed to fetch modules");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []); // 👈 empty array means "run only on first render"

  if (loading) return <p>Loading...</p>;
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
              <a href="#">
                <IconWorld className="!size-5" />
                <span className="text-base font-semibold">Aspect</span>
              </a>
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
