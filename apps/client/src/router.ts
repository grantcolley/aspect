import { createBrowserRouter } from "react-router-dom";
import React from "react";
import App from "./App";

export const router = createBrowserRouter([
  {
    path: "*",
    element: React.createElement(App),
  },
]);
