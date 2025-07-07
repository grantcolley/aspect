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
aspect
├── package.json
├── tsconfig.base.json
├── .gitignore
├── apps/
│   └── client/
│   	├── package.json
│   	└── ... (Vite + React code)
|   └── server/
│   	├── package.json
│   	└── ... (Express API code)
|   └── shared/
|    	├── package.json
|    	└── ... (Shared TypeScript types/utils)
├── db/
│   ├── package.json
│   └── ... (db seed code)
```

### Table of contents
* [Scaffolding the Monorepo](#scaffolding-the-monorepo)
	* [Setup the Workspaces](#setup-the-workspaces)
	* [Initialise the Shared Package](#initialise-the-shared-package)
 	* [Create the DB Seed package](#create-the-db-seed-package)
	* [Client Setup](#client-setup)	
	* [Server Setup](#server-setup)
	* [Run & Build](#run--build)
 	* [Create Monorepo Debug Configuration using `npm` Workspaces](#create-monorepo-debug-configuration-using-npm-workspaces) 
* [Create Interfaces in the Shared Package](#create-interfaces-in-the-shared-package)
* [Create Models in the Shared Package](#create-models-in-the-shared-package)
* [Create Validation using `zod` in the Shared Package](#create-validation-using-zod-in-the-shared-package)
* [Create Main Layout with Sidebar in the Client](#create-main-layout-with-sidebar-in-the-client)
* [Support Dark/Light Theme](#support-darklight-theme)
* [Add Auth0 Authentication to the Client](#add-auth0-authentication-to-the-client)
* [Adding Navigation to the Sidebar](#adding-navigation-to-the-sidebar)
* [Enable CORS in the Node.js Server](#enable-cors-in-the-nodejs-server)
* [Seed the Modules data](#seed-the-modules-data)
* [Add the Navigation Route to the Server](#add-the-navigation-route-to-the-server)
* [Call the Navigation Route from the Client](#call-the-navigation-route-from-the-client)
   
# Scaffolding the Monorepo
### Setup the Workspaces
Create a root folder `aspect` and a subfolder `apps`. Inside `aspect/apps` create three subfolders: `client`, `db`, `server` and `shared`.

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
    "apps/*",
    "db"
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
Inside the `apps/shared` folder:
```bash
npm init -y
```

Install `zod` for model validation.
```bash
npm install zod
```

Configure the `apps/shared/package.json`.
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

Create `apps/shared/tsconfig.json`.
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src"]
}
```

Create subfolder `apps/shared/src/models`, and inside it create the shared `User` class `apps/shared/src/models/user.ts`.
```TypeScript
export class User {
  userId: number;
  name: string;
  email: string;
  permission: string;

  constructor(userId: number, name: string, email: string, permission: string) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.permission = permission;
  }
}
```
### Create the DB Seed package
Install `dotenv`.
```
npm install dotenv
```

Inside the `apps/db` folder create subfolder `apps/db/src/data`.

Create the `apps/db/src/data/userData.ts`.
```TypeScript
import { User } from "../../../apps/shared/src/models/user";

export function getUsers() {
  return [
    new User(1, "Alice", "alice@email.com", "auth_rw"),
    new User(2, "Bob", "bob@email.com", "auth_ro"),
  ];
}
```

Create the `apps/db/src/seedUsers.ts`.
```TypeScript
import { Database } from "sqlite";
import { User } from "../../apps/shared/src/models/user";

export async function seedUsers(db: Database, users: User[]) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  for (const user of users) {
    await db.run(
      "INSERT INTO users (name, email, permission) VALUES (?, ?, ?)",
      user.name,
      user.email,
      user,permission
    );
    console.log(`Inserted: ${user.name}`);
  }

  console.log(`Insert Users Complete.`);
}
```

Create the `apps/db/src/seed.ts`.
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

Configure the `apps/db/package.json`.
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

Create `apps/db/tsconfig.json`.
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

Replace everything in `apps/client/src/index.css` with the following:
```css
@import "tailwindcss";
```

Configure the `apps/client/package.json`.
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
  "extends": "../../tsconfig.base.json",  👈 add extends ../tsconfig.base.json
  
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

Configure the `apps/server/package.json`.
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

Create `apps/server/tsconfig.json`.
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "sourceMap": true,
    "module": "CommonJS",
    "target": "es2020",
    "declaration": true
  },
  "include": ["src"]
}
```

Create subfolder `apps/server/src`, and create a `apps/server/src/index.ts`.
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

### Create Monorepo Debug Configuration using `npm` Workspaces
To debug a monorepo using npm workspaces in VS Code set up multi-target debugging in a single `launch.json`.

To create the Debug Configuration
- Click the Run and Debug icon in the sidebar (or press Ctrl+Shift+D).
- Click “create a launch.json file”.
- Choose Node.js.

VS Code creates a `.vscode/launch.json` file which can be modified as follows:
```json
{
  "version": "0.2.0",
  "compounds": [
    {
      "name": "Full Stack (client + server)",
      "configurations": ["Launch Client", "Launch API Server"]
    }
  ],
  "configurations": [
    {
      "name": "Launch Client",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/apps/client/src",
      "sourceMaps": true,
      "resolveSourceMapLocations": ["${workspaceFolder}/apps/client/src/**/*"]
    },
    {
      "name": "Launch API Server",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["-r", "ts-node/register"],
      "args": ["${workspaceFolder}/apps/server/src/index.ts"],
      "cwd": "${workspaceFolder}/apps/server",
      "env": {
        "NODE_ENV": "development"
      },
      "sourceMaps": true,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```
> [!TIP]
>
> Start debugging but hitting `F5` or click the green ▶️ in the debug panel.

# Create Interfaces in the Shared Package
Create subfolder `apps/shared/src/interfaces`.

Create the `Edibility` and `Permissionable` interfaces 
\
\
`apps/shared/src/interfaces/edibility.ts`
```TypeScript
export interface Editability {
  isReadonlOnly: boolean;
}
```
`apps/shared/src/interfaces/permissionable.ts`
```TypeScript
export interface Permissionable {
  isVisible: boolean;
  permission: string;
}
```

## Create Models in the Shared Package
Create the navigation models `Module`, `Category` and `Page` classes.
\
\
`apps/shared/src/models/page.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Permissionable, Editability {
  pageId: number;
  categoryId: number;
  name: string;
  icon: string;
  url: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;

  constructor(
    pageId: number,
    categoryId: number,
    name: string,
    icon: string,
    url: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false
  ) {
    this.pageId = pageId;
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.url = url;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
  }
}
```
`apps/shared/src/models/category.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Page } from "./page";

export class Category implements Permissionable, Editability {
  categoryId: number;
  moduleId: number;
  name: string;
  icon: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  pages: Page[];

  constructor(
    categoryId: number,
    moduleId: number,
    name: string,
    icon: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false,
    pages: Page[] = []
  ) {
    this.categoryId = categoryId;
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.pages = pages;
  }

  addPage(pages: Page) {
    pages.categoryId = this.categoryId;
    this.pages.push(pages);
  }
}
```
`apps/shared/src/models/module.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Category } from "./category";

export class Module implements Permissionable, Editability {
  moduleId: number;
  name: string;
  icon: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  categories: Category[];

  constructor(
    moduleId: number,
    name: string,
    icon: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false,
    categories: Category[] = []
  ) {
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
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
`apps/shared/src/models/permission.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Permission implements Permissionable, Editability {
  permissionId: number;
  name: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;

  constructor(
    permissionId: number,
    name: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false
  ) {
    this.permissionId = permissionId;
    this.name = name;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
  }
}
```
`apps/shared/src/models/role.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Permission } from "./permission";

export class Role implements Permissionable, Editability {
  roleId: number;
  name: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  permissions: Permission[];

  constructor(
    roleId: number,
    name: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false,
    permissions: Permission[] = []
  ) {
    this.roleId = roleId;
    this.name = name;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.permissions = permissions;
  }
}
```
Update the `User` at `apps/shared/src/models/user.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";
import { Role } from "./role";

export class User implements Permissionable, Editability {
  userId: number;
  name: string;
  email: string;
  permission: string;
  isVisible: boolean;
  isReadonlOnly: boolean;
  roles: Role[];

  constructor(
    userId: number,
    name: string,
    email: string,
    permission: string,
    isVisible: boolean = false,
    isReadonlOnly: boolean = false,
    roles: Role[] = []
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.permission = permission;
    this.isVisible = isVisible;
    this.isReadonlOnly = isReadonlOnly;
    this.roles = roles;
  }
}
```

## Create Validation using `zod` in the Shared Package
Create the navigation validation schema `moduleSchema`, `categorySchema` and `pageSchema`.
\
\
`apps/shared/src/validation/pageSchema.ts`
```TypeScript
import { z } from "zod";

export const pageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  url: z.string().min(1, "URL is required"),
  permission: z.string().min(1, "Permission is required"),
});

export type PageInput = z.infer<typeof pageSchema>;
```
`apps/shared/src/validation/categorySchema.ts`
```TypeScript
import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  permission: z.string().min(1, "Permission is required"),
});

export type CategoryInput = z.infer<typeof categorySchema>;
```
`apps/shared/src/validation/moduleSchema.ts`
```TypeScript
import { z } from "zod";

export const moduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  permission: z.string().min(1, "Permission is required"),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
```

Create the authorisation validation schema `userSchema`, `roleSchema` and `pemissionSchema`.
\
\
`apps/shared/src/validation/pemissionSchema.ts`
```TypeScript
import { z } from "zod";

export const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permission: z.string().min(1, "Permission is required"),
});

export type PermissionInput = z.infer<typeof permissionSchema>;
```
`apps/shared/src/validation/roleSchema.ts`
```TypeScript
import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  permission: z.string().min(1, "Permission is required"),
});

export type RoleInput = z.infer<typeof roleSchema>;
```
`apps/shared/src/validation/userSchema.ts`
```TypeScript
import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  permission: z.string().min(1, "Permission is required"),
});

export type UserInput = z.infer<typeof userSchema>;
```

# Create Main Layout with Sidebar in the Client
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

First, installing the sidebar (and related components) created a folder called `src/` directly under the root application level `aspect/` folder.
The `components` and `hook` folders in `aspect/src/` had to be moved into the `aspect/apps/client/src/` folder, and then delete `aspect/src/`, as follows:
```
aspect/
├── src/   👈 delete src/
│   ├── components/*   👈 move into client/src
│   └── hooks/*        👈 move into client/src
└── apps/
|   └── client/
│   	└── src/   👈 move folders `components` and `hooks` into client/src/ 
```

Second, there is a bug in `components/ui/sidebar.tsx` resulting in the following errror:

`Uncaught SyntaxError: The requested module '/node_modules/.vite/deps/class-variance-authority.js?v=6f2cdce7' does not provide an export named 'VariantProps'`

To fix this go to the top of `components/ui/sidebar.tsx`, and add `type` in front of the import for `VariantProps`, as follows:
```TypeScript
import { cva, type VariantProps } from "class-variance-authority"
```

Create `app-sidebar.tsx` in `apps/client/src/components`.
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

Create `app-sidebar-header.tsx` in `apps/client/src/components`.
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

# Support Dark/Light Theme
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

# Add Auth0 Authentication to the Client

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

Create an `icons` folder at `apps/client/src/components/icons`.
\
\
In the `apps/client/src/components/icons` folder create `iconsMap.ts`.
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

In the `apps/client/src/components/icons` folder create `iconLoader.tsx`.
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

In the `apps/client/src/components/layout` folder create `navigation-panel.tsx`.
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
        <SidebarGroup key={module.moduleId}>
          <SidebarGroupLabel>
            <IconLoader name={module.icon} />
            <span>&nbsp;{module.name}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {module.categories.filter(isVisible).map((category) => (
              <Collapsible
                key={category.categoryId}
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
                        <SidebarMenuSubItem key={page.pageId}>
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
    permission: "admin_ro|admin_rw",
    isVisible: true,
    categories: [
      {
        categoryId: 1,
        name: "Authorisation",
        icon: "authorisation",
        permission: "auth_ro|auth_rw",
        isVisible: true,
        pages: [
          {
            pageId: 1,
            name: "Users",
            icon: "users",
            url: "#",
            permission: "auth_ro|auth_rw",
            isVisible: true,
          },
          {
            pageId: 2,
            name: "Roles",
            icon: "roles",
            url: "#",
            permission: "auth_ro|auth_rw",
            isVisible: true,
          },
          {
            pageId: 3,
            name: "Permissions",
            icon: "permissions",
            url: "#",
            permission: "auth_ro|auth_rw",
            isVisible: true,
          },
        ],
      },
      {
        categoryId: 2,
        name: "Applications",
        icon: "applications",
        permission: "apps_ro|apps_rw",
        isVisible: true,
        pages: [
          {
            pageId: 4,
            name: "Modules",
            icon: "modules",
            url: "#",
            permission: "apps_ro|apps_rw",
            isVisible: true,
          },
          {
            pageId: 5,
            name: "Categories",
            icon: "categories",
            url: "#",
            permission: "apps_ro|apps_rw",
            isVisible: true,
          },
          {
            pageId: 6,
            name: "Pages",
            icon: "pages",
            url: "#",
            permission: "apps_ro|apps_rw",
            isVisible: true,
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

# Enable CORS in the Node.js Server
```
npm install cors
npm install --save-dev @types/cors
```

Update the `apps/server/src/index.ts` to support CORS.
```TypeScript
import express from "express";
import cors from "cors";    	// 👈 import CORS
import { User } from "shared";

const app = express();
const port = 3000;

app.use(	// 👈 use CORS
  cors({
    origin: "http://localhost:5173", // 👈 or use '*' for all origins (not recommended for production)
    credentials: true, // if you're using cookies or HTTP auth
  })
);

app.get("/api/user", (req, res) => {
  const user: User = { userId: 1, name: "Alice" };
  res.json(user);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
```

# Seed the Modules data

Create `db/src/data/moduleData.ts` for the seed modules data.
```TypeScript
import { Module } from "../../../apps/shared/src/models/module";

export function getModules() {
  return [
    {
      moduleId: 1,
      name: "Administration",
      icon: "settings",
      permission: "admin_ro|admin_rw",
      isVisible: true,
      categories: [
        {
          categoryId: 1,
          name: "Authorisation",
          icon: "authorisation",
          permission: "auth_ro|auth_rw",
          isVisible: true,
          pages: [
            {
              pageId: 1,
              name: "Users",
              icon: "users",
              url: "#",
              permission: "auth_ro|auth_rw",
              isVisible: true,
            },
            {
              pageId: 2,
              name: "Roles",
              icon: "roles",
              url: "#",
              permission: "auth_ro|auth_rw",
              isVisible: true,
            },
            {
              pageId: 3,
              name: "Permissions",
              icon: "permissions",
              url: "#",
              permission: "auth_ro|auth_rw",
              isVisible: true,
            },
          ],
        },
        {
          categoryId: 2,
          name: "Applications",
          icon: "applications",
          permission: "apps_ro|apps_rw",
          isVisible: true,
          pages: [
            {
              pageId: 4,
              name: "Modules",
              icon: "modules",
              url: "#",
              permission: "apps_ro|apps_rw",
              isVisible: true,
            },
            {
              pageId: 5,
              name: "Categories",
              icon: "categories",
              url: "#",
              permission: "apps_ro|apps_rw",
              isVisible: true,
            },
            {
              pageId: 6,
              name: "Pages",
              icon: "pages",
              url: "#",
              permission: "apps_ro|apps_rw",
              isVisible: true,
            },
          ],
        },
      ],
    },
  ] as Module[];
}
```

Create the `db/src/seedModules.ts`
```TypeScript
import { Database } from "sqlite";
import { Module } from "../../apps/shared/src/models/module";

export async function seedModules(db: Database, modules: Module[]) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS modules (
      moduleId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      categoryId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      pageId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      url TEXT NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE moduleCategories (
        moduleId INTEGER,
        categoryId INTEGER,
        PRIMARY KEY (moduleId, categoryId),
        FOREIGN KEY (moduleId) REFERENCES modules(moduleId),
        FOREIGN KEY (categoryId) REFERENCES categories(categoryId)
    );
  `);

  await db.exec(`
    CREATE TABLE categoryPages (
        categoryId INTEGER,
        pageId INTEGER,
        PRIMARY KEY (categoryId, pageId),
        FOREIGN KEY (categoryId) REFERENCES categories(categoryId),
        FOREIGN KEY (pageId) REFERENCES pages(pageId)
    );
  `);

  const modulesStatement = await db.prepare(
    "INSERT INTO modules (moduleId, name, icon, permission) VALUES (?, ?, ?, ?)"
  );

  const categoryStatement = await db.prepare(
    "INSERT INTO categories (categoryId, name, icon, permission) VALUES (?, ?, ?, ?)"
  );

  const pageStatement = await db.prepare(
    "INSERT INTO pages (pageId, name, icon, url, permission) VALUES (?, ?, ?, ?, ?)"
  );

  const moduleCategoriesStatement = await db.prepare(
    "INSERT INTO moduleCategories (moduleId, categoryId) VALUES (?, ?)"
  );

  const categoryPagesStatement = await db.prepare(
    "INSERT INTO categoryPages (categoryId, pageId) VALUES (?, ?)"
  );

  for (const module of modules) {
    await modulesStatement.run(
      module.moduleId,
      module.name,
      module.icon,
      module.permission
    );
    console.log(`Inserted: ${module.name}`);

    for (const category of module.categories) {
      await categoryStatement.run(
        category.categoryId,
        category.name,
        category.icon,
        category.permission
      );
      console.log(`Inserted: ${category.name}`);

      await moduleCategoriesStatement.run(module.moduleId, category.categoryId);
      console.log(
        `Inserted: moduleId ${module.moduleId}, categoryId ${category.categoryId}`
      );

      for (const page of category.pages) {
        await pageStatement.run(
          page.pageId,
          page.name,
          page.icon,
          page.url,
          page.permission
        );
        console.log(`Inserted: ${page.name}`);

        await categoryPagesStatement.run(category.categoryId, page.pageId);
        console.log(
          `Inserted: categoryId ${category.categoryId}, pageId ${page.pageId}`
        );
      }
    }
  }

  modulesStatement.finalize();
  categoryStatement.finalize();
  pageStatement.finalize();
  moduleCategoriesStatement.finalize();
  categoryPagesStatement.finalize();

  await db.each("SELECT moduleId, name, icon FROM modules", (err, row) => {
    console.log(`Inserted ${row.name}`);
  });

  console.log(`Insert Modules Complete.`);
}
```

Update the `db/src/seed.ts` to seed the module data.
```TypeScript

// existing code removed for brevity
 
import { getUsers } from "./data/userData";
import { seedModules } from "./seedModules"; // 👈 add
import { getModules } from "./data/moduleData"; // 👈 add
const fs = require("fs");

// existing code removed for brevity

  let users = getUsers();
  let modules = getModules();  // 👈 add

  await seedUsers(db, users);
  await seedModules(db, modules);  // 👈 add

// existing code removed for brevity
```

> [!TIP]
> Seeding the data can be done by by running the following command.
> 
> ```
> npm --workspace db run seed
> ```

# Add the Navigation Route to the Server
In the Server project, create the `apps/server/src/data/db.ts` for connecting to the database.
```TypeScript
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const initDb = async (dbFile: string) => {
  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  return db;
};
```

Create data interface `apps/server/src/interfaces/navigationRow.ts` for extracting the rows from the database.
```TypeScript
export interface NavigationRow {
  moduleId: number;
  mName: string;
  mIcon: string;
  mPermission: string;

  categoryId: number;
  cName: string;
  cIcon: string;
  cPermission: string;

  pageId: number;
  pName: string;
  pIcon: string;
  pUrl: string;
  pPermission: string;
}
```

Create the route `apps/server/src/route/navigation.ts`.`
```TypeScript
import { Router, Request, Response, RequestHandler } from "express";
import { Database } from "sqlite";
import { NavigationRow } from "../interfaces/navigationRow";
import { Module } from "shared/src/models/module";
import { Category } from "shared/src/models/category";
import { Page } from "shared/src/models/page";

export default function createNavigationRoute(db: Database) {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    const rows: NavigationRow[] = await db.all(`
      SELECT  m.moduleId, m.name mName, m.icon mIcon, m.permission mPermission,
              c.categoryId, c.name cName, c.icon cIcon, c.permission cPermission,
              p.pageId, p.name pName, p.icon pIcon, p.url pUrl, p.permission pPermission
      FROM 	modules m
      INNER JOIN moduleCategories mc ON m.moduleId = mc.moduleId
      INNER JOIN categories c ON mc.categoryId = c.categoryId
      INNER JOIN categoryPages cp ON c.categoryId = cp.categoryId
      INNER JOIN pages p ON cp.pageId = p.pageId;
    `);

    const modulesMap = new Map<number, Module>();
    const categoriesMap = new Map<number, Category>();

    for (const row of rows) {
      let module = modulesMap.get(row.moduleId);
      if (!module) {
        module = new Module(
          row.moduleId,
          row.mName,
          row.mIcon,
          row.mPermission,
          true
        );
        modulesMap.set(row.moduleId, module);
      }

      let category = categoriesMap.get(row.categoryId);
      if (!category) {
        category = new Category(
          row.categoryId,
          row.moduleId,
          row.cName,
          row.cIcon,
          row.cPermission,
          true
        );
        categoriesMap.set(row.categoryId, category);
      }

      const moduleCategory = module.categories.some(
        (category) => category.categoryId === row.categoryId
      );
      if (!moduleCategory) {
        module.addCategory(category);
      }

      const page = new Page(
        row.pageId,
        row.categoryId,
        row.pName,
        row.pIcon,
        row.pUrl,
        row.pPermission,
        true
      );

      if (!category.pages.some((p) => p.pageId === page.pageId)) {
        category.addPage(page);
      }
    }

    res.json(Array.from(modulesMap.values()));
  });

  return router;
}
```
Create `apps/server/env.development`
```
HOST_URL=localhost
HOST_PORT=3000
CORS_URL=http://localhost:5173
ENDPOINT_NAVIGATION=/api/navigation
```

Update the `apps/server/src/index.ts`
```TypeScript
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import createNavigationRoute from "./routes/navigation";
import { initDb } from "./data/db";

const env = process.env.NODE_ENV || "development";

dotenv.config({ path: path.resolve(__dirname, `../../../.env.${env}`) });
dotenv.config({ path: path.resolve(__dirname, `../.env.${env}`) });

const HOST = process.env.HOST_URL || "localhost";
const PORT = process.env.HOST_PORT ? parseInt(process.env.HOST_PORT) : 3000;

if (!process.env.DATABASE) {
  throw new Error("DATABASE environment variable is not set");
}

if (!process.env.ENDPOINT_NAVIGATION) {
  throw new Error("ENDPOINT_NAVIGATION environment variable is not set");
}

const dbFile = path.resolve(__dirname, `../../../db/${process.env.DATABASE}`);
const navigationEndpoint = process.env.ENDPOINT_NAVIGATION;

const app = express();
app.use(express.json());

if (process.env.CORS_URL) {
  app.use(
    cors({
      origin: `${process.env.CORS_URL}`, // or use '*' for all origins (not recommended for production)
      credentials: true, // if you're using cookies or HTTP auth
    })
  );
}

const start = async () => {
  const db = await initDb(dbFile);

  app.use(navigationEndpoint, createNavigationRoute(db));

  if (!HOST) {
    app.listen(PORT, () =>
      console.log(`Server running on http://${HOST}:${PORT}`)
    );
  } else {
    app.listen(PORT, HOST, () =>
      console.log(`Server running on http://${HOST}:${PORT}`)
    );
  }
};

start();
```
# Call the Navigation Route from the Client
In the Client project update the the `.env.developmnent` file.
```
VITE_REACT_APP_AUTH0_DOMAIN=
VITE_REACT_APP_AUTH0_CLIENT_ID=
VITE_REACT_API_URL=http://localhost:3000  // 👈 add local API url
VITE_REACT_API_NAVIGATION_URL=api/navigation // 👈 add navigation route
```

Update `app-sidebar.tsx` to fetch module data from the web API's navigation route.
```TypeScript
import * as React from "react";
import { useEffect, useState } from "react";
import { IconWorld } from "@tabler/icons-react";
import { NavigationPanel } from "@/components/layout/navigation-panel";
import { Module } from "shared/src/models/module";
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
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigationUrl = `${import.meta.env.VITE_REACT_API_URL}/${
    import.meta.env.VITE_REACT_API_NAVIGATION_URL
  }`;

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(navigationUrl);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Module[] = await response.json();

        setModules(data);
      } catch (err) {
        setError("Failed to fetch modules");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []); // 👈 empty array means "run only on first render"

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

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
        <NavigationPanel modules={modules}></NavigationPanel>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
```
