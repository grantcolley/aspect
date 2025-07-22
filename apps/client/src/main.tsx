import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/layout/theme-provider";
import Auth0ProviderWithNavigate from "@/components/layout/auth0-provider-with-navigate.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate>
        <ThemeProvider defaultTheme="system" storageKey="aspect-ui-theme">
          <App />
        </ThemeProvider>
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>
);
