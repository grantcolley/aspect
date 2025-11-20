import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchPermissions } from "@/requests/fetch-permissions";

type Permission = string;

type PermissionsContextType = {
  permissions: Set<Permission> | null; // null while loading or unauthenticated
  isLoading: boolean;
  isError: boolean;
  has: (p: Permission) => boolean;
  hasAny: (ps: Permission[]) => boolean;
};

const PermissionsContext = createContext<PermissionsContextType | undefined>(
  undefined
);

export function PermissionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const [permissions, setPermissions] = useState<Set<Permission> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.sub) {
      setPermissions(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const token = await getAccessTokenSilently();
        const data = await fetchPermissions(token);
        if (!cancelled) setPermissions(new Set(data));
      } catch (err) {
        if (!cancelled) setIsError(true);
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.sub, getAccessTokenSilently]);

  const value = useMemo<PermissionsContextType>(
    () => ({
      permissions,
      isLoading,
      isError,
      has: (p: Permission) => !!permissions?.has(p),
      hasAny: (ps: Permission[]) => ps.some((p) => permissions?.has(p)),
    }),
    [permissions, isLoading, isError]
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx)
    throw new Error("usePermissions must be used within a PermissionsProvider");
  return ctx;
}
