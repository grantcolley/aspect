import React from "react";

interface LazyComponentMap {
  [key: string]: React.LazyExoticComponent<React.FC<{ args: string }>>;
}

export const fetchLazyComponents: () => LazyComponentMap =
  (): LazyComponentMap => ({
    GenericModelTable: React.lazy(() => import("../pages/generic-model-table")),
    GenericModelForm: React.lazy(() => import("../pages/generic-model-form")),
  });
