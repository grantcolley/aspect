# aspect

##### A monorepo using npm workspaces, consisting of:
###### client: React + Vite + TypeScript + shadcn/ui + react-router + react-hook-form + zod
###### server: Node.js + Express + TypeScript + SQLite
###### shared: TypeScript-only package with shared types and utilities

The project structure looks something like this:
```
aspect/
├── package.json
├── tsconfig.base.json
├── .gitignore
├── client/
│   ├── package.json
│   └── ... (Vite + React code)
├── server/
│   ├── package.json
│   └── ... (Express API code)
└── shared/
    ├── package.json
    └── ... (Shared TypeScript types/utils)
```

### Table of contents
* [Scaffolding the `aspect` Monorepo](#scaffolding-the-aspect-monorepo)
	* [Initialise the Monorepo](#initialise-the-monorepo)
	* [Initialise the Shared Package](#initialise-the-shared-package)
	* [Client Setup](#client-setup)	
	* [Server Setup](#server-setup)
	* [Run & Build](#run--build)
* [Client](#client)
   * [Create Main Layout with Sidebar](#create-main-layout-with-sidebar)
   * [Support Dark/Light Theme](#support-darklight-theme)
   * [Add Auth0 Authentication to the Client](#add-auth0-authentication-to-the-client)
* [Server](#server)
  
 
# Scaffolding the `aspect` Monorepo
### Initialise the Monorepo
Create a root folder `aspect`, and inside create three subfolders: `client`, `server` and `shared`.

Inside the root `aspect` folder:
```bash
npm init -y
```

Configure the root `package.json`.
```json
{
  "name": "aspect",
  "version": "1.0.0",
  "description": "Aspect",
  "workspaces": [
    "client",
    "server",
    "shared"
  ]
}
```

Create a root `tsconfig.base.json`.
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "."
  }
}
```

Replace the content of `.gitignore` with:
```nginx
node_modules
dist
.env
*.sqlite
```

### Initialise the Shared Package
Inside the `shared` folder:
```bash
npm init -y
```

Configure the `shared/package.json`.
```json
{
  "name": "shared",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
  }
}
```

Create `shared/tsconfig.json`.
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]
}
```

Create subfolder `src/models`, and inside it create `shared/src/models/user.ts` for the example shared class `User`.
```TypeScript
export interface User {
  id: number;
  name: string;
  email: string;
}
```

### Client Setup
In the root `aspect` folder run:
```bash
npm create vite@latest client -- --template react-ts
```

In the `client` folder run:
```bash
cd client
npm install
npm install react-router-dom react-hook-form zod
npm install tailwindcss @tailwindcss/vite
npm install -D @types/node
```

Replace everything in `client/src/index.css` with the following:
```css
@import "tailwindcss";
```

Configure the `client/package.json`.
```json
{

  ... removed for brevity	

  "dependencies": {
    "shared": "*",    👈 add shared

    ... removed for brevity
  
  },

  ... removed for brevity
}
```

Add the following code to the `tsconfig.json` file to resolve paths.
```json
  "extends": "../tsconfig.base.json",  👈 add extends ../tsconfig.base.json
  
  ... removed for brevity

  "compilerOptions": {  👈 add compilerOptions...
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  
  ... removed for brevity
```

Add the following code to the `tsconfig.app.json` file to resolve paths.
```json
{
  "compilerOptions": {
    ... removed for brevity
    
    "paths": {  👈 add paths to compilerOptions...
      "@/*": ["./src/*"]
    }
	
    ... removed for brevity
  }
}
```

Add the following code to the `vite.config.ts` so your app can resolve paths without error:
```TypeScript
import path from "path";  /* 👈 add */
import tailwindcss from "@tailwindcss/vite";  /* 👈 add */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],  /* 👈 add tailwindcss() */
  resolve: {  /* 👈 add resolve */
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Install [`shadcn/ui`](https://ui.shadcn.com/):
```bash
npx shadcn@latest init
```

Install [tabler icons](https://tabler.io/icons).
```bash
npm install @tabler/icons-react
```
Set `iconLibrary` in `components.js` to `tabler`.
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",

  // other options...
  
  "iconLibrary": "tabler"
}
```

### Server Setup
In the `server` folder run:
```bash
npm init -y
npm install express sqlite3
npm install -D typescript ts-node-dev @types/express @types/node
```

Configure the `server/package.json`.
```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "dist/index.js",  👈 edit main
  "types": "dist/index.d.ts",  👈 add types
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",  👈 add dev
    "build": "tsc",  👈 add build
  },
  "dependencies": {
    "shared": "*",  👈 add shared
    "express": "^4.18.2",
    "sqlite3": "^5.1.6"
  },
```

Create `server/tsconfig.json`.
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]
}
```

Create subfolder `src`, and create a `server/src/index.ts`.
```TypeScript
import express from "express";
import { User } from "shared";

const app = express();
const port = 3000;

app.get("/api/user", (req, res) => {
  const user: User = { id: 1, name: "Alice" };
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

### Run & Build
```bash
# Run shared build first if used by others
npm run --workspace shared build

# Start dev server
npm run --workspace server dev

# Start dev client
npm run --workspace client dev
```

Launch the server and client in the browser:
\
Server: `http://localhost:3000/api/user`
![Alt text](/readme-images/server.png?raw=true "Server API")

Client: `http://localhost:5173/`
![Alt text](/readme-images/client-initial.png?raw=true "Client")

# Client
## Create Main Layout with Sidebar
First, change the browser tab's title and icon in `index.html`.
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" sizes="16x16" href="/atlas.png" /> <!-- 👈 change icon -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Aspect</title> <!-- 👈 change title -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

In `App.css` change the `max-width` and `padding`.
```css
#root {
  max-width: 100%;
  margin: 0 auto;
  padding: 0%;
  text-align: center;
}
```

In `main.tsx` wrap the `<App />` component with `<BrowserRouter>`.
```TypeScript
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"; // 👈 add
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>  // 👈 add
      <App />
    </BrowserRouter> // 👈 add
  </StrictMode>
);
```

Install the `sidebar` components.
```bash
npx shadcn@latest add sidebar
```

> [!CAUTION]
> Installing the shadcn/ui sidebar came with two unexpected issues that needed to be resolved.

First, installing the sidebar (and related components) created a folder called `src\` directly under the root application level `aspect\` folder.
The `components` and `hook` folders in `aspect\src\` had to be moved into the `aspect\client\src\` folder, and then delete `aspect\src\`, as follows:
```
aspect/
├── src/   👈 delete src/
│   ├── components/*   👈 move into client/src
│   └── hooks/*        👈 move into client/src
└── client/
│   └── src/   👈 move folders `components` and `hooks` into client/src/ 
```

Second, there is a bug in `components\ui\sidebar.tsx` resulting in the following errror:

`Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/class-variance-authority.js?v=6f2cdce7' does not provide an export named 'VariantProps'`

To fix this go to the top of `components\ui\sidebar.tsx`, and add `type` in front of the import for `VariantProps`, as follows:
```TypeScript
import { cva, type VariantProps } from "class-variance-authority"
```

Create `app-sidebar.tsx` in `client\src\components`.
```TypeScript
import * as React from "react";
import { IconWorld } from "@tabler/icons-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconWorld className="!size-5" />
                <span className="text-base font-semibold">Aspect</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent></SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
```

Create `sidebar-header.tsx` in `client\src\components`.
```TypeScript
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SidebarHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Home</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/grantcolley/aspect"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

Change the App.tsx.
```TypeScript
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarHeader } from "@/components/sidebar-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import "./App.css";

function App() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SidebarHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2"></div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default App;
```

Client: `http://localhost:5173/`
![Alt text](/readme-images/client-sidebar.png?raw=true "Client")

## Support Dark/Light Theme
Install `dropdown` and `tooltip` components.
```bash
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tooltip
```

Create the `theme-provider.tsx`.
```TypeScript
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "aspect-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
```

Create the `theme-toggle.tsx`.
```TypeScript
import { IconMoon, IconSun } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useTheme } from "@/components/layout/theme-provider";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <IconSun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <IconMoon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
```

Wrap your root layout in `App.tsx`.
```TypeScript
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarHeader } from "@/components/layout/sidebar-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/components/layout/theme-provider";  // 👈 add import
import "./App.css";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="aspect-ui-theme">  // 👈 add ThemeProvider
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SidebarHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2"></div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;
```

Add `ThemeToggle` to `sidebar-header.tsx`.
```TypeScript
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";  // 👈 add import

export function SidebarHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Home</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />  		 			// 👈 add ThemeToggle
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/grantcolley/aspect"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

Client: `http://localhost:5173/`
![Alt text](/readme-images/client-theme.png?raw=true "Client")

## Add Auth0 Authentication to the Client

> [!TIP]
>
> Review the Auth0 instructions for setting up and configuring authentication.
>
> [React Authentication By Example: Using React Router 6](https://developer.auth0.com/resources/guides/spa/react/basic-authentication)
> \
> [Complete Guide to React User Authentication](https://auth0.com/blog/complete-guide-to-react-user-authentication/)
> \
> [Auth0 React QuickStart](https://auth0.com/docs/quickstart/spa/react)

Create the Auth0 application for `Aspect.Client` following the Auth0 instructions above.

Install the Auth0 React SDK
```bash
npm install @auth0/auth0-react
```

Create the `.env.developmnent` file.
```
VITE_REACT_APP_AUTH0_DOMAIN=  // 👈 Auth0 domain
VITE_REACT_APP_AUTH0_CLIENT_ID=  // 👈 Auth0 application clientId
```

Create `auth0-provider-with-navigate.tsx`.
```TypeScript
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

const Auth0ProviderWithNavigate: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const domain = import.meta.env.VITE_REACT_APP_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_REACT_APP_AUTH0_CLIENT_ID;

  if (!(domain && clientId)) {
    return null;
  }

  const navigate = useNavigate();

  interface AppState {
    returnTo?: string;
  }

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{ redirect_uri: window.location.origin }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;
```

Configure the `auth0-provider-with-navigate.tsx` component in `main.tsx`.
```TypeScript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Auth0ProviderWithNavigate from "@/components/layout/auth0-provider-with-navigate.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Auth0ProviderWithNavigate> // 👈 inside <BrowserRouter><BrowserRouter />
        <App />
      </Auth0ProviderWithNavigate>
    </BrowserRouter>
  </StrictMode>
);
```

Create the `login.tsx` component.
```TypeScript
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { IconLogin2 } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => loginWithRedirect()}
          >
            <IconLogin2 />
            <span className="sr-only">Login</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Login</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default Login;
```

Create the `logout.tsx` component.
```TypeScript
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
```

Create the `authentication.tsx` component.
```TypeScript
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
```

Add the `authentication.tsx` component to the `sidebar-header.tsx`.
```TypeScript
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Authentication from "./authentication"; // 👈 import Authentication

export function SidebarHeader() {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Home</h1>
        <div className="ml-auto flex items-center gap-2">
          <Authentication /> // 👈 add authentication
          <ThemeToggle />
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/grantcolley/aspect"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

Login button
![Alt text](/readme-images/login-auth0.png?raw=true "Login")

Athenticate
![Alt text](/readme-images/authenticate-auth0.png?raw=true "Authenticate")

Authenticated with logout button
![Alt text](/readme-images/authenticated-auth0.png?raw=true "Authenticated")

# Server



