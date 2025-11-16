import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Auth0Provider } from "@auth0/auth0-react";
import { config } from "@/config/config";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { RoutesProvider } from "./context/routes-context";
import { PermissionsProvider } from "./context/permissions-context";
import ErrorPage from "@/pages/error-page";
import App from "./App";
import "reflect-metadata";
import "./index.css";
import "shared/src/decorators/index";

const router = createBrowserRouter([
  {
    path: "*",
    element: (
      <ErrorBoundary FallbackComponent={ErrorPage}>
        <App />
      </ErrorBoundary>
    ),
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="aspect-ui-theme">
      <Auth0Provider
        domain={config.AUTH0_DOMAIN}
        clientId={config.AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: config.AUTH0_AUDIENCE || undefined,
        }}
        onRedirectCallback={(appState) => {
          router.navigate(appState?.returnTo || window.location.pathname);
        }}
      >
        <PermissionsProvider>
          <RoutesProvider>
            <RouterProvider router={router} />
          </RoutesProvider>
        </PermissionsProvider>
      </Auth0Provider>
    </ThemeProvider>
  </StrictMode>
);
