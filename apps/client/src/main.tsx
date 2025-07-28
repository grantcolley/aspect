import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/layout/theme-provider";
import Auth0ProviderApp from "@/auth/auth0-provider-app.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="aspect-ui-theme">
      <Auth0ProviderApp>
        <App />
      </Auth0ProviderApp>
    </ThemeProvider>
  </StrictMode>
);
