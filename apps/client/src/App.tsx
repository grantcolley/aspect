import { useEffect, useState, Suspense } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthenticationRoute } from "@/auth/authentication-route";
import { fetchLazyComponents } from "@/utils/fetch-lazy-components";
import { fetchModules } from "@/requests/fetch-modules";
import { useAuth0 } from "@auth0/auth0-react";
import NotFound from "./pages/not-found";
import "./App.css";

const lazyComponents = fetchLazyComponents();

function App() {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);

  useEffect(() => {
    const setupRoutes = async () => {
      let routes: RouteObject[] = [];
      let children: RouteObject[] = [];
      let modules: any[] = [];

      if (isAuthenticated) {
        const token = await getAccessTokenSilently();

        modules = await fetchModules(token);

        const pages = modules.flatMap((module) =>
          module.categories.flatMap(
            (category: { pages: any }) => category.pages
          )
        );

        children = pages.map((p) => {
          const LazyComp = lazyComponents[p.component] ?? NotFound;
          const element = (
            <Suspense fallback={<div>Loading...</div>}>
              <AuthenticationRoute>
                <LazyComp key={p.pageId} />
              </AuthenticationRoute>
            </Suspense>
          );

          return {
            path: p.path,
            element,
          };
        });
      }

      children.push({ path: "*", element: <NotFound /> });

      routes = [
        {
          path: "/",
          element: <MainLayout modules={modules ?? []} />,
          children,
        },
      ];

      setRouter(createBrowserRouter(routes));
    };

    setupRoutes();
  }, [isAuthenticated]);

  if (isLoading || !router) return <></>;

  return <RouterProvider router={router} />;
}

export default App;
