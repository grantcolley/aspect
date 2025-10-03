import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { IconLogout } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Logout = () => {
  const { logout } = useAuth0();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            aria-label="Logout"
          >
            <IconLogout />
            <span className="sr-only">Logout</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Logout</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Logout;
