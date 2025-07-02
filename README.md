# aspect

Create step-by-step a monorepo solution using npm workspaces containing a React + TypeScript web client, a TypeScript web api, and a SQLite database. 

The Aspect web client is built using React, Vite, TypeScript, shadcn/ui, react-router, react-hook-form, and zod for validation. 

The Aspect web API is built using Node.js, Express, TypeScript and a SQLite database.

Both the client and server consume the same TypeScript classes in a shared package.

Authentication is implemented using Auth0.

##### Technology:
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
├── db/
│   ├── package.json
│   └── ... (db seed code)
├── server/
│   ├── package.json
│   └── ... (Express API code)
└── shared/
    ├── package.json
    └── ... (Shared TypeScript types/utils)
```

### Table of contents
* [Scaffolding the Monorepo](#scaffolding-the-monorepo)
	* [Setup the Workspaces](#setup-the-workspaces)
	* [Initialise the Shared Package](#initialise-the-shared-package)
 	* [Create the DB Seed package](#create-the-db-seed-package)
	* [Client Setup](#client-setup)	
	* [Server Setup](#server-setup)
	* [Run & Build](#run--build)
* [The Shared Package](#the-shared-package)
   * [Create Interfaces](#create-interfaces)
   * [Create Models](#create-models)
   * [Create Validation](#create-validation)
* [The Client](#the-client)
   * [Create Main Layout with Sidebar](#create-main-layout-with-sidebar)
   * [Support Dark/Light Theme](#support-darklight-theme)
   * [Add Auth0 Authentication to the Client](#add-auth0-authentication-to-the-client)
   * [Adding Navigation to the Sidebar](#adding-navigation-to-the-sidebar)
* [The Server](#the-server)
  
 
# Scaffolding the Monorepo
### Setup the Workspaces
Create a root folder `aspect`, and inside create three subfolders: `client`, `db`, `server` and `shared`.

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
    "db",
    "server",
    "shared",
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

Create a `env.development` file.
```
DATABASE=aspect.sqlite
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

Install `zod` for model validation.
```bash
npm install zod
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

Create subfolder `src/models`, and inside it create the shared `User` class `shared/src/models/user.ts`.
```TypeScript
export class User {
  userId: number;
  name: string;
  email: string;

  constructor(userId: number, name: string, email: string) {
    this.userId = userId;
    this.name = name;
    this.email = email;
  }
}
```
### Create the DB Seed package
Install `dotenv`.
```
npm install dotenv
```

Inside the `db` folder create subfolders `/src/data`.

Create the `db/src/data/userData.ts`.
```TypeScript
import { User } from "shared/src/models/user";

export function getUsers() {
  return [
    new User(1, "Alice", "alice@email.com", false),
    new User(2, "Grant", "grant@email.com", false),
  ];
}
```

Create the `db/src/seedUsers.ts`.
```TypeScript
import { Database } from "sqlite";
import { User } from "shared/src/models/user";

export async function seedUsers(db: Database, users: User[]) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL
    );
  `);

  for (const user of users) {
    await db.run(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      user.name,
      user.email
    );
    console.log(`Inserted: ${user.name}`);
  }

  console.log(`Insert Users Complete.`);
}
```

Create the `db/src/seed.ts`.
```TypeScript
import dotenv from "dotenv";
import path from "path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seedUsers";
import { getUsers } from "./data/userData";
const fs = require("fs");

sqlite3.verbose();

async function seed() {
  dotenv.config({ path: path.resolve(__dirname, "../../.env.development") });

  let dbFile = `./${process.env.DATABASE}`;

  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log(`Existing database deleted ${dbFile}`);
  }

  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  let users = getUsers();

  await seedUsers(db, users);

  await db.close();
  console.log(`Database seeding complete: ${dbFile}`);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
```

Configure the `db/package.json`.
```json
{
  "name": "db",
  "version": "1.0.0",
  "main": "src/seed.ts",
  "scripts": {
    "seed": "ts-node src/seed.ts"
  },
  "dependencies": {
    "dotenv": "^10.0.0",
    "sqlite3": "^5.1.7"
  },
  "devDependencies": {
    "ts-node": "^10.0.0",
    "typescript": "^5.8.3"
  }
}
```

Create `db/tsconfig.json`.
```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "outDir": "dist"
  },
  "include": ["src"]
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
npm install express sqlite sqlite3
npm install -D typescript ts-node-dev @types/express @types/node
npm install zod
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
    "module": "CommonJS",
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
  const user: User = { userId: 1, name: "Alice" };
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

# Create and seed the database
npm run --workspace db seed

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

# The Shared Package
## Create Interfaces
Create subfolder `shared/src/interfaces`.

Create the `Edibility` and `Permissionable` interfaces 
\
\
`shared/src/interfaces/edibility.ts`
```TypeScript
export interface Editability {
  isReadonlOnly: boolean;
}
```
`shared/src/interfaces/permissionable.ts`
```TypeScript
export interface Permissionable {
  isVisible: boolean;
  permission: string;
}
```

## Create Models
Create the navigation models `Module`, `Category` and `Page` classes.
\
\
`shared/src/models/page.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Editability, Permissionable {
  pageId: number;
  categoryId: number;
  name: string;
  icon: string;
  url: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  permission: string;

  constructor(
    pageId: number,
    categoryId: number,
    name: string,
    icon: string,
    url: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    permission: string
  ) {
    this.pageId = pageId;
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.permission = permission;
  }
}
```
`shared/src/models/category.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Page } from "./page";

export class Category implements Editability, Permissionable {
  categoryId: number;
  moduleId: number;
  name: string;
  icon: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  permission: string;
  pages: Page[];

  constructor(
    categoryId: number,
    moduleId: number,
    name: string,
    icon: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    permission: string,
    pages: Page[] = []
  ) {
    this.categoryId = categoryId;
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.permission = permission;
    this.pages = pages;
  }

  addPage(pages: Page) {
    pages.categoryId = this.categoryId;
    this.pages.push(pages);
  }
}
```
`shared/src/models/module.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Category } from "./category";

export class Module implements Editability, Permissionable {
  moduleId: number;
  name: string;
  icon: string;
  isReadonlOnly: boolean;
  isVisible: boolean;
  permission: string;
  categories: Category[];

  constructor(
    moduleId: number,
    name: string,
    icon: string,
    isReadonlOnly: boolean,
    isVisible: boolean,
    permission: string,
    categories: Category[] = []
  ) {
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.isReadonlOnly = isReadonlOnly;
    this.isVisible = isVisible;
    this.permission = permission;
    this.categories = categories;
  }

  addCategory(category: Category) {
    category.moduleId = this.moduleId;
    this.categories.push(category);
  }
}
```
Create the authorisation models `User`, `Role` and `Permission` classes.
\
\
`shared/src/models/permission.ts`
```TypeScript
import { Editability } from "../interfaces/editability";

export class Permission implements Editability {
  permissionId: number;
  name: string;
  isReadonlOnly: boolean;

  constructor(permissionId: number, name: string, isReadonlOnly: boolean) {
    this.permissionId = permissionId;
    this.name = name;
    this.isReadonlOnly = isReadonlOnly;
  }
}
```
`shared/src/models/role.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permission } from "./permission";

export class Role implements Editability {
  roleId: number;
  name: string;
  isReadonlOnly: boolean;
  permissions: Permission[];

  constructor(
    roleId: number,
    name: string,
    isReadonlOnly: boolean,
    permissions: Permission[] = []
  ) {
    this.roleId = roleId;
    this.name = name;
    this.isReadonlOnly = isReadonlOnly;
    this.permissions = permissions;
  }
}
```
Update the `User` at `shared/src/models/user.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Role } from "./role";

export class User implements Editability {
  userId: number;
  name: string;
  email: string;
  isReadonlOnly: boolean;
  roles: Role[];

  constructor(
    userId: number,
    name: string,
    email: string,
    isReadonlOnly: boolean,
    roles: Role[] = []
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.isReadonlOnly = isReadonlOnly;
    this.roles = roles;
  }
}
```

## Create Validation
Create the navigation validation schema `moduleSchema`, `categorySchema` and `pageSchema`.
\
\
`shared/src/validation/pageSchema.ts`
```TypeScript
import { z } from "zod";

export const pageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  url: z.string().min(1, "URL is required"),
});

export type PageInput = z.infer<typeof pageSchema>;
```
`shared/src/validation/categorySchema.ts`
```TypeScript
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
```
`shared/src/validation/moduleSchema.ts`
```TypeScript
import { z } from "zod";

export const moduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
```

Create the authorisation validation schema `userSchema`, `roleSchema` and `pemissionSchema`.
\
\
`shared/src/validation/pemissionSchema.ts`
```TypeScript
import { z } from "zod";

export const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type PermissionInput = z.infer<typeof permissionSchema>;
```
`shared/src/validation/roleSchema.ts`
```TypeScript
import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type RoleInput = z.infer<typeof roleSchema>;
```
`shared/src/validation/userSchema.ts`
```TypeScript
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export type UserInput = z.infer<typeof userSchema>;
```

# The Client
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

Create `app-sidebar-header.tsx` in `client\src\components`.
```TypeScript
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AppSidebarHeader() {
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

Change the `App.tsx`.
```TypeScript
import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarHeader } from "@/components/app-sidebar-header";
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
        <AppSidebarHeader />
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

Add the `authentication.tsx` component to the `app-sidebar-header.tsx`.
```TypeScript
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Authentication from "./authentication"; // 👈 import Authentication

export function AppSidebarHeader() {
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

# Adding Navigation to the Sidebar
Install the `collapsible` component.
```bash
npx shadcn@latest add collapsible
```

Create an `icons` folder at `client\src\components\icons`.
\
\
In the `client\src\components\icons` folder create `iconsMap.ts`.
```TypeScript
import {
  IconHome,
  IconUser,
  IconSettings,
  IconSearch,
  IconShieldCog,
  IconUsersGroup,
  IconUserCircle,
  IconShieldLock,
  IconAppsFilled,
} from "@tabler/icons-react";

export const iconsMap: Record<string, React.FC<any>> = {
  home: IconHome,
  user: IconUser,
  search: IconSearch,
  settings: IconSettings,
  authorisation: IconShieldCog,
  users: IconUsersGroup,
  roles: IconUserCircle,
  permissions: IconShieldLock,
  applications: IconAppsFilled,
};
```

In the `client\src\components\icons` folder create `iconLoader.tsx`.
```TypeScript
import React from "react";
import { IconPhotoExclamation } from "@tabler/icons-react";
import { iconsMap } from "./iconsMap";

type IconLoaderProps = {
  name: keyof typeof iconsMap;
};

const IconLoader: React.FC<IconLoaderProps> = ({ name }) => {
  const IconComponent = iconsMap[name];

  if (!IconComponent) {
    return <IconPhotoExclamation />;
  }

  return <IconComponent />;
};

export default IconLoader;
```

In the `client\src\components\layout` folder create `navigation-panel.tsx`.
```TypeScript
import { IconChevronRight } from "@tabler/icons-react";
import IconLoader from "@/components/icons/IconLoader";
import { Module } from "shared/src/models/module";
import type { Visibility } from "shared/src/interfaces/visibility";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type Props = {
  modules: Module[];
};

const isVisible = (visibility: Visibility) => {
  return visibility.isVisible;
};

export function NavigationPanel({ modules }: Props) {
  return (
    <>
      {modules.filter(isVisible).map((module) => (
        <SidebarGroup>
          <SidebarGroupLabel>
            <IconLoader name={module.icon} />
            <span>&nbsp;{module.name}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {module.categories.filter(isVisible).map((category) => (
              <Collapsible
                key={category.id}
                asChild
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={category.name}>
                      <IconLoader name={category.icon} />
                      <span>{category.name}</span>
                      <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {category.pages?.filter(isVisible).map((page) => (
                        <SidebarMenuSubItem key={page.name}>
                          <SidebarMenuSubButton asChild>
                            <a href={page.url}>
                              <IconLoader name={page.icon} />
                              <span>{page.name}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
```

Update `app-sidebar.tsx` to add `NavigationPanel` and pass dummy data into it.
```TypeScript
import * as React from "react";
import { IconWorld } from "@tabler/icons-react";
import { NavigationPanel } from "@/components/layout/navigation-panel"; // 👈 import the NavigationPanel
import { Module } from "shared/src/models/module"; // 👈 import Module
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = [	// 👈 create the dummy data
  {
    moduleId: 1,
    name: "Administration",
    icon: "settings",
    permission: "admin",
    categories: [
      {
        categoryId: 1,
        name: "Authorisation",
        icon: "authorisation",
        permission: "auth",
        pages: [
          {
            pageId: 1,
            name: "Users",
            icon: "users",
            url: "#",
            permission: "auth",
          },
          {
            pageId: 2,
            name: "Roles",
            icon: "roles",
            url: "#",
            permission: "auth",
          },
          {
            pageId: 3,
            name: "Permissions",
            icon: "permissions",
            url: "#",
            permission: "auth",
          },
        ],
      },
      {
        categoryId: 2,
        name: "Applications",
        icon: "applications",
        permission: "apps",
        pages: [
          {
            pageId: 4,
            name: "Modules",
            icon: "modules",
            url: "#",
            permission: "apps",
          },
          {
            pageId: 5,
            name: "Categories",
            icon: "categories",
            url: "#",
            permission: "apps",
          },
          {
            pageId: 6,
            name: "Pages",
            icon: "pages",
            url: "#",
            permission: "apps",
          },
        ],
      },
    ],
  },
] as Module[];

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
      <SidebarContent>
        <NavigationPanel modules={data}></NavigationPanel> // 👈 add NavigationPanel, passing dummy data into it
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
```
Client: `http://localhost:5173/`
![Alt text](/readme-images/client-navigation.png?raw=true "Client")

# The Server



