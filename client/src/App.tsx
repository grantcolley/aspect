import { AppSidebar } from "@/components/app-sidebar";
import { SidebarHeader } from "@/components/sidebar-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "./App.css";

function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SidebarHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2"></div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
