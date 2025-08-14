import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router-dom";

export const AuthenticatedRoute = ({
  children,
}: {
  children: React.JSX.Element;
}) => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading)
    return <p className="text-muted-foreground text-sm">Loading...</p>;

  return isAuthenticated ? children : <Navigate to="/" replace />;
};
