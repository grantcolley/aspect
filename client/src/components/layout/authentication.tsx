import { useAuth0 } from "@auth0/auth0-react";
import Login from "./login";
import Logout from "./logout";

const Authentication = () => {
  const { user, isAuthenticated } = useAuth0();

  return (
    <div>
      {isAuthenticated ? (
        <div className="ml-auto flex items-center gap-2">
          <p className="text-muted-foreground">{user?.name}</p>
          <Logout />
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Authentication;
