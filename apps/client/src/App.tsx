import { Suspense, useEffect, useState } from "react";
import { Route, Routes, type RouteObject } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthenticatedRoute } from "@/auth/authenticated-route";
import { fetchLazyComponents } from "@/utils/fetch-lazy-components";
import { fetchModules } from "@/requests/fetch-modules";
import { Module } from "shared/src/models/module";
import NotFound from "./pages/not-found";
import "./App.css";

const lazyComponents = fetchLazyComponents();

function renderRoutes(routeObjects: RouteObject[]) {
  return routeObjects.map((r, i) => {
    return <Route key={i} path={r.path} element={r.element} />;
  });
}

function App() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } =
    useAuth0();
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const loadRoutes = async () => {
      let apiRoutes: RouteObject[] = [];
      let apiModules: Module[] = [];

      if (isAuthenticated && user?.sub) {
        const token = await getAccessTokenSilently();

        apiModules = await fetchModules(token);

        setModules(apiModules);

        const pages = apiModules.flatMap((module) =>
          module.categories.flatMap(
            (category: { pages: any }) => category.pages
          )
        );

        apiRoutes = pages.map((p) => {
          const LazyComp = lazyComponents[p.component] ?? NotFound;
          const element = (
            <Suspense fallback={<div>Loading...</div>}>
              <AuthenticatedRoute>
                <LazyComp key={p.pageId} args={p.args} />
              </AuthenticatedRoute>
            </Suspense>
          );

          return {
            path: p.path,
            element,
          };
        });

        routes.push({ path: "*", element: <NotFound /> });

        setRoutes(apiRoutes);
        setModules(apiModules);
      } else if (!isLoading && !isAuthenticated) {
        setRoutes([]);
        setModules([]);
      }
    };

    loadRoutes();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout modules={modules ?? []} />}>
        {renderRoutes(routes)}{" "}
      </Route>
    </Routes>
  );
}

export default App;
