import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  Suspense,
} from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { type RouteObject } from "react-router-dom";
import { fetchModules } from "@/requests/fetch-modules";
import { fetchLazyComponents } from "@/utils/fetch-lazy-components";
import { AuthenticatedRoute } from "@/auth/authenticated-route";
import NotFound from "@/pages/not-found";
import { Module } from "shared/src/models/module";

//
// ---------- Types ----------
//
type AddRoutesFn = <T>(
  items: T[],
  parentPath: string | undefined,
  mapFn: (item: T) => RouteObject
) => void;

type RoutesContextType = {
  routes: RouteObject[];
  modules: Module[];
  addRoutes: AddRoutesFn;
};

//
// ---------- Context ----------
//
const RoutesContext = createContext<RoutesContextType>({
  routes: [],
  modules: [],
  addRoutes: () => {
    throw new Error("RoutesContext not initialized");
  },
});

export function useRoutesContext() {
  return useContext(RoutesContext);
}

const lazyComponents = fetchLazyComponents();

//
// ---------- Helpers ----------
//
function insertNestedRoutes(
  baseRoutes: RouteObject[],
  newRoutes: RouteObject[],
  parentPath?: string
): RouteObject[] {
  if (!parentPath) {
    const merged = [...baseRoutes, ...newRoutes];
    return dedupeRoutes(merged);
  }

  const [head, ...rest] = parentPath.split("/").filter(Boolean);

  return baseRoutes.map((route) => {
    // Skip index routes (cannot have children)
    if (route.index) return route;

    if (route.path === head) {
      if (rest.length === 0) {
        // Found the parent
        const children = Array.isArray(route.children) ? route.children : [];
        const merged = [...children, ...newRoutes];
        return { ...route, children: dedupeRoutes(merged) };
      } else {
        // Go deeper
        const updatedChildren = insertNestedRoutes(
          Array.isArray(route.children) ? route.children : [],
          newRoutes,
          rest.join("/")
        );
        return { ...route, children: updatedChildren };
      }
    }
    return route;
  });
}

function dedupeRoutes(routes: RouteObject[]): RouteObject[] {
  return Array.from(
    new Map(
      routes.map((r) => [r.index ? "__index" : r.path ?? "__unknown", r])
    ).values()
  );
}

//
// ---------- Provider ----------
//
export function RoutesProvider({ children }: { children: ReactNode }) {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } =
    useAuth0();
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  const addRoutes: AddRoutesFn = (items, parentPath, mapFn) => {
    const newRoutes = items.map(mapFn);

    setRoutes((prev) => {
      const updated = insertNestedRoutes(prev, newRoutes, parentPath);
      // Always keep NotFound at the end
      return updated.concat({ path: "*", element: <NotFound /> });
    });
  };

  useEffect(() => {
    const loadRoutes = async () => {
      if (!isAuthenticated || !user?.sub) {
        setRoutes([]);
        setModules([]);
        return;
      }

      const token = await getAccessTokenSilently();
      const apiModules = await fetchModules(token);
      setModules(apiModules);

      const pages = apiModules.flatMap((m) =>
        m.categories.flatMap((c: { pages: any }) => c.pages)
      );

      const apiRoutes: RouteObject[] = pages.map((p) => {
        const LazyComp = lazyComponents[p.component] ?? NotFound;
        return {
          path: p.path,
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <AuthenticatedRoute>
                <LazyComp key={p.pageId} args={p.args} />
              </AuthenticatedRoute>
            </Suspense>
          ),
        };
      });

      setRoutes(
        dedupeRoutes(apiRoutes).concat({ path: "*", element: <NotFound /> })
      );
    };

    if (!isLoading) loadRoutes();
  }, [isAuthenticated, getAccessTokenSilently, user?.sub, isLoading]);

  return (
    <RoutesContext.Provider value={{ routes, modules, addRoutes }}>
      {children}
    </RoutesContext.Provider>
  );
}
