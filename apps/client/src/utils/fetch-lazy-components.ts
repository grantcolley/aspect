import React from "react";

interface LazyComponentMap {
  [key: string]: React.LazyExoticComponent<React.FC>;
}

export const fetchLazyComponents: () => LazyComponentMap =
  (): LazyComponentMap => ({
    GenericGrid: React.lazy(() => import("../pages/generic-grid")),
  });
