import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppSidebarHeader } from "@/components/layout/app-sidebar-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Module } from "shared/src/models/module";
import Auth0ProviderWithNavigate from "@/auth/auth0-provider-with-navigate";

type Props = {
  modules: Module[];
};

export const MainLayout = ({ modules }: Props) => {
  return (
    <Auth0ProviderWithNavigate>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar modules={modules} variant="inset" />
        <SidebarInset>
          <AppSidebarHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Auth0ProviderWithNavigate>
  );
};
