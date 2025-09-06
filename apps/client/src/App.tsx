import { Route, Routes, type RouteObject } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { useRoutesContext } from "@/context/routes-context";
import "./App.css";

function renderRoutes(routes: RouteObject[]) {
  return routes.map((r, i) => (
    <Route key={i} path={r.path} element={r.element}>
      {r.children ? renderRoutes(r.children) : null}
    </Route>
  ));
}

function App() {
  const { routes, modules } = useRoutesContext();

  return (
    <Routes>
      <Route path="/" element={<MainLayout modules={modules ?? []} />}>
        {renderRoutes(routes)}{" "}
      </Route>
    </Routes>
  );
}

export default App;
