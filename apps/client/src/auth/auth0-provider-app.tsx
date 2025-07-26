import { Auth0Provider } from "@auth0/auth0-react";
import { config } from "@/config/config";

const Auth0ProviderApp: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  return (
    <Auth0Provider
      domain={config.AUTH0_DOMAIN}
      clientId={config.AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: config.AUTH0_AUDIENCE || undefined,
      }}
      onRedirectCallback={() => window.location.origin}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderApp;
