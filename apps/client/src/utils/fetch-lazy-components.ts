import React from "react";

interface LazyComponentMap {
  [key: string]: React.LazyExoticComponent<React.FC>;
}

export const fetchLazyComponents: () => LazyComponentMap =
  (): LazyComponentMap => ({
    GenericDataTable: React.lazy(() => import("../pages/generic-data-table")),
  });
