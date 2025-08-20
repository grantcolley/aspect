# aspect

Create step-by-step a monorepo solution using npm workspaces containing a React + TypeScript web client, a TypeScript web api, and a SQLite database. 

The Aspect web client is built using React, Vite, TypeScript, shadcn/ui, react-router, react-hook-form, and zod for validation. 

The Aspect web API is built using Node.js, Express, TypeScript, a SQLite database and the Winston logging library.

Both the client and server consume the same TypeScript classes in a shared package.

Authentication is implemented using Auth0.

##### Technology:
###### client: React + Vite + TypeScript + shadcn/ui + react-router + react-hook-form + zod
###### server: Node.js + Express + TypeScript + SQLite + Winston (logging)
###### shared: TypeScript-only package with shared types and utilities

The project structure looks something like this:
```
aspect
├── package.json
├── tsconfig.base.json
├── .gitignore
├── db/
│   ├── package.json
│   └── ... (db seed code)
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
* [Centralize Access to `env` Variables in a `config.ts` Module](#centralize-access-to-env-variables-in-a-configts-module)
	* [Client `config.ts`](#client-configts)
	* [Server `config.ts`](#server-configts)
* [Add Auth0 Authentication to the Client](#add-auth0-authentication-to-the-client)
* [Add Auth0 Authentication to the Server](#add-auth0-authentication-to-the-server)
* [Add the Navigation Route to the Server](#add-the-navigation-route-to-the-server)
* [Enable CORS in the Node.js Server](#enable-cors-in-the-nodejs-server)
* [Seed the Modules data](#seed-the-modules-data)
* [Adding Navigation to the Sidebar](#adding-navigation-to-the-sidebar)
* [Call the API from the Client](#call-the-api-from-the-client)
* [Add Structured Error Handling to the Node.js Server](#add-structured-error-handling-to-the-nodejs-server)
* [Add Logging to the Node.js Server](#add-logging-to-the-nodejs-server)
* [Seed the Authorisation data](#seed-the-authorisation-data)
* [Add API Endpoints](#add-api-Endpoints)
	* [Create Endpoint Variables in `.env` File](#create-endpoint-variables-in-env-file)
	* [Add the Authorisation Endpoints](#add-the-authorisation-endpoints)
 	* [Add the Applications Endpoints](#add-the-applications-endpoints)
  	* [Update the index.ts](#update-the-indexts) 
* [Test the Endpoints using Postman](#test-the-endpoints-using-postman)
* [Create a Generic DataTable Component](#create-a-generic-datatable-component)
* [Add Dynamic Route Loading](#add-dynamic-route-loading)
  
# Scaffolding the Monorepo
## Setup the Workspaces
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

Replace the content of `.gitignore` with:
```nginx
node_modules
dist
.env
*.sqlite
```

## Initialise the Shared Package
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
## Create the DB Seed package
Install `dotenv`.
```
npm install dotenv
```

Inside the `apps/db` folder create `apps/db/.env` file.
```
DATABASE=./aspect.sqlite
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
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seedUsers";
import { getUsers } from "./data/userData";

sqlite3.verbose();

async function seed() {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  if (!process.env.DATABASE) {
    throw new Error("DATABASE environment variable is not set");
  }

  let dbFile = process.env.DATABASE;

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

## Server Setup
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

## Run & Build
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

## Create Monorepo Debug Configuration using `npm` Workspaces
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
  permission: string;
}
```
`apps/shared/src/interfaces/categoryPage.ts`
```TypeScript
export interface CategoryPage {
  categoryId: number;
  pageId: number;
}
```
`apps/shared/src/interfaces/moduleCategory.ts`
```TypeScript
export interface ModuleCategory {
  moduleId: number;
  categoryId: number;
}
```
`apps/shared/src/interfaces/rolePermission.ts`
```TypeScript
export interface RolePermission {
  roleId: number;
  permissionId: number;
}
```
`apps/shared/src/interfaces/userRole.ts`
```TypeScript
export interface UserRole {
  userId: number;
  roleId: number;
}
```
`apps/shared/src/interfaces/navigationRow.ts`
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
  pPath: string;
  pComponent: string;
  pPermission: string;
}
```

# Create Models in the Shared Package
Create the navigation models `Module`, `Category` and `Page` classes.
\
\
`apps/shared/src/models/page.ts`
```TypeScript
import { Editability } from "../interfaces/editability";
import { Permissionable } from "../interfaces/permissionable";

export class Page implements Permissionable, Editability {
  pageId: number;
  name: string;
  icon: string;
  path: string;
  component: string;
  permission: string;
  isReadonlOnly: boolean;

  constructor(
    pageId: number,
    name: string,
    icon: string,
    path: string,
    component: string,
    permission: string,
    isReadonlOnly: boolean = false
  ) {
    this.pageId = pageId;
    this.name = name;
    this.icon = icon;
    this.path = path;
    this.component = component;
    this.permission = permission;
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
  name: string;
  icon: string;
  permission: string;
  isReadonlOnly: boolean;
  pages: Page[];

  constructor(
    categoryId: number,
    name: string,
    icon: string,
    permission: string,
    isReadonlOnly: boolean = false,
    pages: Page[] = []
  ) {
    this.categoryId = categoryId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isReadonlOnly = isReadonlOnly;
    this.pages = pages;
  }

  addPage(pages: Page) {
    if (!this.pages.find((p) => p.pageId === pages.pageId)) {
      this.pages.push(pages);
    }
  }

  removePage(pageId: number) {
    this.pages = this.pages.filter((p) => p.pageId !== pageId);
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
  isReadonlOnly: boolean;
  categories: Category[];

  constructor(
    moduleId: number,
    name: string,
    icon: string,
    permission: string,
    isReadonlOnly: boolean = false,
    categories: Category[] = []
  ) {
    this.moduleId = moduleId;
    this.name = name;
    this.icon = icon;
    this.permission = permission;
    this.isReadonlOnly = isReadonlOnly;
    this.categories = categories;
  }

  addCategory(category: Category) {
    if (!this.categories.find((c) => c.categoryId === category.categoryId)) {
      this.categories.push(category);
    }
  }

  removeCategory(categoryId: number) {
    this.categories = this.categories.filter(
      (c) => c.categoryId !== categoryId
    );
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
  isReadonlOnly: boolean;

  constructor(
    permissionId: number,
    name: string,
    permission: string,
    isReadonlOnly: boolean = false
  ) {
    this.permissionId = permissionId;
    this.name = name;
    this.permission = permission;
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
  isReadonlOnly: boolean;
  permissions: Permission[];

  constructor(
    roleId: number,
    name: string,
    permission: string,
    isReadonlOnly: boolean = false,
    permissions: Permission[] = []
  ) {
    this.roleId = roleId;
    this.name = name;
    this.permission = permission;
    this.isReadonlOnly = isReadonlOnly;
    this.permissions = permissions;
  }

  addPermission(permission: Permission) {
    if (
      !this.permissions.find((p) => p.permissionId === permission.permissionId)
    ) {
      this.permissions.push(permission);
    }
  }

  removePermission(permissionId: number) {
    this.permissions = this.permissions.filter(
      (p) => p.permissionId !== permissionId
    );
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
  isReadonlOnly: boolean;
  roles: Role[];

  constructor(
    userId: number,
    name: string,
    email: string,
    permission: string,
    isReadonlOnly: boolean = false,
    roles: Role[] = []
  ) {
    this.userId = userId;
    this.name = name;
    this.email = email;
    this.permission = permission;
    this.isReadonlOnly = isReadonlOnly;
    this.roles = roles;
  }

  addRole(role: Role) {
    if (!this.roles.find((r) => r.roleId === role.roleId)) {
      this.roles.push(role);
    }
  }

  removeRole(roleId: number) {
    this.roles = this.roles.filter((r) => r.roleId !== roleId);
  }
}
```

# Create Validation using `zod` in the Shared Package
Create the navigation validation schema `moduleSchema`, `categorySchema` and `pageSchema`.
\
\
`apps/shared/src/validation/pageSchema.ts`
```TypeScript
import { z } from "zod";

export const pageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  path: z.string().min(1, "Path is required"),
  component: z.string().min(1, "Component is required"),
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

Create `apps/client/src/components/layout/app-sidebar.tsx`.
```TypeScript
import * as React from "react";
import { Link } from "react-router-dom";
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
              <Link to="/">
                <IconWorld className="!size-5" />
                <span className="text-base font-semibold">Aspect</span>
              </Link>
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

Create `apps/client/src/components/layout/app-sidebar-header.tsx`.
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

Create `apps/client/src/components/layout/main-layout.tsx`.
```TypeScript
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppSidebarHeader } from "@/components/layout/app-sidebar-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const MainLayout = () => {
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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
```

Create page `apps/client/src/pages/not-found.tsx`.
```TypeScript
const NotFound = () => (
  <>
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-20">
      Oops!
    </h4>
    <p className="text-muted-foreground text-xl">Nothing to see here...</p>
    <p className="text-muted-foreground text-sm">404 - Not Found</p>
  </>
);
export default NotFound;
```

Change the `App.tsx`.
```TypeScript
import { useEffect, useState } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);

  useEffect(() => {
    const setupRoutes = async () => {
      let routes: RouteObject[] = [];
      let children: RouteObject[] = [];

      children.push({ path: "*", element: <NotFound /> });

      routes = [
        {
          path: "/",
          element: <MainLayout />,
          children,
        },
      ];

      setRouter(createBrowserRouter(routes));
    };

    setupRoutes();
  }, []);

  if (!router) return <></>;

  return <RouterProvider router={router} />;
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

Create the `apps/client/src/components/layout/theme-provider.tsx`.
```TSX
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

Create the `apps/client/src/components/layout/theme-toggle.tsx`.
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

In `main.tsx` wrap `<App>` with `<ThemeProvider>`.
```TSX
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/layout/theme-provider";  // 👈 add import
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="aspect-ui-theme"> // 👈 
      <App />
    </ThemeProvider> // 👈 
  </StrictMode>
);
```

Add `ThemeToggle` to `sidebar-header.tsx`.
```TSX
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

# Centralize Access to `env` Variables in a `config.ts` Module
The best way to access `.env` variables is to:
- Centralize access in a `config.ts` module
- Type them for safety
- Fail fast if any required `env` variables are missing by using `zod` for runtime validation

### Client `config.ts`
Create `.env` file at `apps/client/.env`
```
VITE_REACT_APP_AUTH0_DOMAIN=// 👈 Auth0 domain
VITE_REACT_APP_AUTH0_CLIENT_ID=// 👈 Auth0 application clientId
```

Create `apps/client/src/config/config.ts`
```TypeScript
import { z } from "zod";

const envSchema = z.object({
  VITE_REACT_APP_AUTH0_DOMAIN: z.string().min(1),
  VITE_REACT_APP_AUTH0_CLIENT_ID: z.string().min(1),
});

const env = envSchema.parse(import.meta.env);

export const config = {
  AUTH0_DOMAIN: env.VITE_REACT_APP_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: env.VITE_REACT_APP_AUTH0_CLIENT_ID,
};
```
Client environment variables can now be consumed anywhere like this:
```JSX
import { config } from "@/config/config";

const domain = config.AUTH0_DOMAIN;
```

### Server `config.ts`
Create `.env` file at `apps/server/.env`
```
NODE_ENV=development
HOST_URL=localhost
HOST_PORT=3000
DATABASE=../../../../db/aspect.sqlite
CORS_URL=http://localhost:5173
ENDPOINT_NAVIGATION=/api/navigation
```

Create `apps/server/src/config/config.ts`
```TypeScript
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  HOST_URL: z.string().min(1),
  HOST_PORT: z.string().transform(Number),
  DATABASE: z.string().min(1),
  CORS_URL: z.string().min(1),
  ENDPOINT_NAVIGATION: z.string().min(1)
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(
    "Invalid environment variables:",
    env.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const config = env.data;
```
Server environment variables can now be consumed anywhere like this:
```JSX
import { config } from "@/config/config";

const hostUrl = config.HOST_URL;
```

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

Add `<Auth0Provider>` to `main.tsx`.
```TypeScript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Auth0Provider } from "@auth0/auth0-react"; // 👈 import Auth0Provider
import { config } from "@/config/config"; // 👈 import config
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="aspect-ui-theme">
      <Auth0Provider   { /* 👈 add Auth0Provider */ }
        domain={config.AUTH0_DOMAIN}
        clientId={config.AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: config.AUTH0_AUDIENCE || undefined,
        }}
      >
        <App />
      </Auth0Provider>
    </ThemeProvider>
  </StrictMode>
);
```

Create the `apps/client/src/auth/login.tsx` component.
```TSX
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

Create the `apps/client/src/auth/logout.tsx` component.
```TSX
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

Create the `apps/client/src/auth/authentication.tsx` component.
```TSX
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
```TSX
import { useAuth0 } from "@auth0/auth0-react"; // 👈 import
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Authentication from "../../auth/authentication"; // 👈 import

export function AppSidebarHeader() {
  const { isAuthenticated } = useAuth0(); // 👈

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        {isAuthenticated ? ( // 👈
          <>
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
          </>
        ) : (
          <></>
        )}
        <h1 className="text-base font-medium">Home</h1>
        <div className="ml-auto flex items-center gap-2">
          <Authentication /> // 👈
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

# Add Auth0 Authentication to the Server
> [!TIP]
>
> Review the Auth0 instructions for setting up and configuring authentication.
>
> [Node (Express) API: Authorization](https://auth0.com/docs/quickstart/backend/nodejs/01-authorization)

Install the Auth0 SDK in the server.
```
npm install --save express-oauth2-jwt-bearer
```

Update the server's `apps/server/.env`.
```
NODE_ENV=development
HOST_URL=localhost
HOST_PORT=3000
DATABASE=../../../../db/aspect.sqlite
AUTH_AUDIENCE=https://Aspect.API.com 	// 👈 add
AUTH_ISSUER_BASE_URL=https:		// 👈 add
AUTH_TOKEN_SIGNING_ALGORITHM=RS256 	// 👈 add
CORS_URL=http://localhost:5173
ENDPOINT_NAVIGATION=/api/navigation
```
Update the server's `apps/server/src/index.ts`
```TypeScript
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { auth } from "express-oauth2-jwt-bearer"; // 👈 import
import { config } from "./config/config";
import { errorHandler } from "./middleware/errorHandler";
import navigationRouter from "./routes/navigation";

// code removed for brevity

const start = async () => {

// 👇 new code

  const jwtCheck = auth({
    audience: config.AUTH_AUDIENCE,
    issuerBaseURL: config.AUTH_ISSUER_BASE_URL,
    tokenSigningAlg: config.AUTH_TOKEN_SIGNING_ALGORITHM,
  });

  // enforce on all endpoints
  app.use(jwtCheck);

// 👆 new code

  app.use(navigationEndpoint, navigationRouter);

  app.use(errorHandler);

// code removed for brevity

};

start();
```

Update the client's `apps/client/.env`
```
VITE_REACT_APP_AUTH0_DOMAIN=
VITE_REACT_APP_AUTH0_CLIENT_ID=
VITE_REACT_APP_AUTH0_AUDIENCE=https://Aspect.API.com  // 👈 add the audience
VITE_REACT_API_URL=http://localhost:3000
VITE_REACT_API_NAVIGATION_URL=api/navigation
```
Update `apps/client/src/config/config.ts`
```TypeScript
import { z } from "zod";

const envSchema = z.object({
  VITE_REACT_APP_AUTH0_DOMAIN: z.string().min(1),
  VITE_REACT_APP_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_REACT_APP_AUTH0_AUDIENCE: z.string().min(1), // 👈 add the audience
  VITE_REACT_API_URL: z.string().min(1),
  VITE_REACT_API_NAVIGATION_URL: z.string().min(1),
});

const env = envSchema.parse(import.meta.env);

export const config = {
  AUTH0_DOMAIN: env.VITE_REACT_APP_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: env.VITE_REACT_APP_AUTH0_CLIENT_ID,
  AUTH0_AUDIENCE: env.VITE_REACT_APP_AUTH0_AUDIENCE, // 👈 add the audience
  API_URL: env.VITE_REACT_API_URL,
  API_NAVIGATION_URL: env.VITE_REACT_API_NAVIGATION_URL,
};
```

Update `Update `apps/client/src/components/layout/app-sidebar-header.tsx`.
```TypeScript
import { useAuth0 } from "@auth0/auth0-react";  // 👈 add
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import Authentication from "./authentication";

export function AppSidebarHeader() {
  const { isAuthenticated } = useAuth0();

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">

	// 👇 new code

        {isAuthenticated ? (
          <>
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
          </>
        ) : (
          <></>
        )}

	// 👆 new code

	<h1 className="text-base font-medium">Home</h1>
        <div className="ml-auto flex items-center gap-2">
          <Authentication />
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

# Add the Navigation Route to the Server
In the Server project, create the `apps/server/src/data/db.ts` for connecting to the database.
```TypeScript
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dbConnection = async (dbFile: string) => {
  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  return db;
};
```

Create the route `apps/server/src/route/navigation.ts`.
```TypeScript
import path from "path";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { NavigationRow } from "shared/src/interfaces/navigationRow";
import { Module } from "shared/src/models/module";
import { Category } from "shared/src/models/category";
import { Page } from "shared/src/models/page";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const rows: NavigationRow[] = await db.all(`
      SELECT  m.moduleId, m.name mName, m.icon mIcon, m.permission mPermission,
              c.categoryId, c.name cName, c.icon cIcon, c.permission cPermission,
              p.pageId, p.name pName, p.icon pIcon, p.path pPath, p.component pComponent, p.permission pPermission
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
          row.cName,
          row.cIcon,
          row.cPermission
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
        row.pName,
        row.pIcon,
        row.pPath,
        row.pComponent,
        row.pPermission
      );

      if (!category.pages.some((p) => p.pageId === page.pageId)) {
        category.addPage(page);
      }
    }

    res.json(Array.from(modulesMap.values()));
  })
);

export default router;
```

Update the `apps/server/src/index.ts`
```TypeScript
import express from "express";
import { config } from "./config/config";
import navigationRouter from "./routes/navigation";

const app = express();
app.use(express.json());

const start = async () => {
  app.use(config.ENDPOINT_NAVIGATION, navigationRouter);

  app.listen(config.HOST_PORT, config.HOST_URL, () =>
    console.log(
      `Server running on http://${config.HOST_URL}:${config.HOST_PORT}`
    )
  );
};

start();
```

# Enable CORS in the Node.js Server
```
npm install cors
npm install --save-dev @types/cors
```

Update the `apps/server/src/index.ts` to support CORS.
```TypeScript
import express from "express";
import cors from "cors"; // 👈 import CORS
import { config } from "./config/config";
import navigationRouter from "./routes/navigation";

const app = express();
app.use(express.json());

if (config.CORS_URL) {
  app.use( // 👈 use CORS
    cors({
      origin: `${config.CORS_URL}`, // or use '*' for all origins (not recommended for production)
      credentials: true, // if you're using cookies or HTTP auth
    })
  );
}

const start = async () => {
  app.use(config.ENDPOINT_NAVIGATION, navigationRouter);

  app.listen(config.HOST_PORT, config.HOST_URL, () =>
    console.log(
      `Server running on http://${config.HOST_URL}:${config.HOST_PORT}`
    )
  );
};

start();
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
      categories: [
        {
          categoryId: 1,
          name: "Authorisation",
          icon: "authorisation",
          permission: "admin_ro|admin_rw",
          pages: [
            {
              pageId: 1,
              name: "Users",
              icon: "users",
              path: "users",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 2,
              name: "Roles",
              icon: "roles",
              path: "roles",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 3,
              name: "Permissions",
              icon: "permissions",
              path: "permissions",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
          ],
        },
        {
          categoryId: 2,
          name: "Applications",
          icon: "applications",
          permission: "admin_ro|admin_rw",
          pages: [
            {
              pageId: 4,
              name: "Modules",
              icon: "modules",
              path: "modules",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 5,
              name: "Categories",
              icon: "categories",
              path: "categories",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
            },
            {
              pageId: 6,
              name: "Pages",
              icon: "pages",
              path: "pages",
              component: "GenericDataTable",
              permission: "admin_ro|admin_rw",
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
      path TEXT NOT NULL,
      component TEXT NOT NULL,
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
    "INSERT INTO pages (pageId, name, icon, path, component, permission) VALUES (?, ?, ?, ?, ?, ?)"
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
          page.path,
          page.component,
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

# Adding Navigation to the Sidebar
Install the `collapsible` component.
```bash
npx shadcn@latest add collapsible
```

Create an `icons` folder at `apps/client/src/components/icons`.
\
\
Create `apps/client/src/components/icons/iconsMap.ts`.
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

Create `apps/client/src/components/icons/iconLoader.tsx`.
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

Create `apps/client/src/components/layout/navigation-panel.tsx`.
```TypeScript
import { Link } from "react-router-dom";
import { IconChevronRight } from "@tabler/icons-react";
import IconLoader from "@/components/icons/IconLoader";
import { Module } from "shared/src/models/module";
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

export function NavigationPanel({ modules }: Props) {
  return (
    <>
      {modules.map((module) => (
        <SidebarGroup key={module.moduleId}>
          <SidebarGroupLabel>
            <IconLoader name={module.icon} />
            <span>&nbsp;{module.name}</span>
          </SidebarGroupLabel>
          <SidebarMenu>
            {module.categories.map((category) => (
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
                      {category.pages?.map((page) => (
                        <SidebarMenuSubItem key={page.pageId}>
                          <SidebarMenuSubButton asChild>
                            <Link to={page.path}>
                              <IconLoader name={page.icon} />
                              <span>{page.name}</span>
                            </Link>
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

Update `app-sidebar.tsx` to add `NavigationPanel` to pass `module` data into it.
```TypeScript
import * as React from "react";
import { Link } from "react-router-dom";
import { IconWorld } from "@tabler/icons-react";
import { NavigationPanel } from "@/components/layout/navigation-panel";  // 👈 import
import { Module } from "shared/src/models/module";  // 👈 import
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Props = {  // 👈 add
  modules: Module[];
} & React.ComponentProps<typeof Sidebar>;

export function AppSidebar({ modules, ...props }: Props) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/">
                <IconWorld className="!size-5" />
                <span className="text-base font-semibold">Aspect</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavigationPanel modules={modules}></NavigationPanel>  // 👈 add
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
```

# Call the API from the Client
In the Client project update the the `.env` file.
```
VITE_REACT_APP_AUTH0_DOMAIN=
VITE_REACT_APP_AUTH0_CLIENT_ID=
VITE_REACT_API_URL=http://localhost:3000  // 👈 add local API url
VITE_REACT_API_NAVIGATION_URL=api/navigation // 👈 add navigation route
```
Update `apps/client/src/config/config.ts`
```TypeScript
import { z } from "zod";

const envSchema = z.object({
  VITE_REACT_APP_AUTH0_DOMAIN: z.string().min(1),
  VITE_REACT_APP_AUTH0_CLIENT_ID: z.string().min(1),
  VITE_REACT_API_URL: z.string().min(1), // 👈 add local API url
  VITE_REACT_API_NAVIGATION_URL: z.string().min(1), // 👈 add navigation route
});

const env = envSchema.parse(import.meta.env);

export const config = {
  AUTH0_DOMAIN: env.VITE_REACT_APP_AUTH0_DOMAIN,
  AUTH0_CLIENT_ID: env.VITE_REACT_APP_AUTH0_CLIENT_ID,
  API_URL: env.VITE_REACT_API_URL, // 👈 add local API url
  API_NAVIGATION_URL: env.VITE_REACT_API_NAVIGATION_URL, // 👈 add navigation route
};
```

Create page `apps/client/src/pages/generic-data-table.tsx` for the target path for pages in the navigation panel.
```TypeScript
import { useLocation, type Location } from "react-router-dom";

function GenericDataTable() {
  const location: Location = useLocation();
  return (
    <div className="text-red-500">GenericDataTable for {location.pathname}</div>
  );
}

export default GenericDataTable;
```

Create page `apps/client/src/pages/not-found.tsx` for the fallback if the target path doesn't find the intended page.
```TypeScript
const NotFound = () => (
  <>
    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight mt-20">
      Oops!
    </h4>
    <p className="text-muted-foreground text-xl">Nothing to see here...</p>
    <p className="text-muted-foreground text-sm">404 - Not Found</p>
  </>
);
export default NotFound;
```

Create utility function `apps/client/src/utils/fetch-lazy-components.ts` for `fetchLazyComponents` to handle deferred loading of target route components.
```TypeScript
import React from "react";

interface LazyComponentMap {
  [key: string]: React.LazyExoticComponent<React.FC>;
}

export const fetchLazyComponents: () => LazyComponentMap =
  (): LazyComponentMap => ({
    GenericDataTable: React.lazy(() => import("../pages/generic-data-table")),
  });
```

Create request function `apps/client/src/utils/fetch-modules.ts` for `fetchModules` to handle the request to the API.
```TypeScript
import { config } from "@/config/config";
import { Module } from "shared/src/models/module";

export const fetchModules = async (token: string) => {
  const navigationUrl = `${config.API_URL}/${config.API_NAVIGATION_URL}`;

  const response = await fetch(navigationUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: Module[] = await response.json();

  return data;
};
```

Finally, update `App.tsx` to fetch the modules and dynamically load the `routes` using the response.
```TypeScript
import { useEffect, useState, Suspense } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  type RouteObject,
} from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthenticatedRoute } from "@/auth/authenticated-route";
import { fetchLazyComponents } from "@/utils/fetch-lazy-components";
import { fetchModules } from "@/requests/fetch-modules";
import { useAuth0 } from "@auth0/auth0-react";
import NotFound from "./pages/not-found";
import "./App.css";

const lazyComponents = fetchLazyComponents();

function App() {
  const { isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0();
  const [router, setRouter] = useState<ReturnType<
    typeof createBrowserRouter
  > | null>(null);

  useEffect(() => {
    const setupRoutes = async () => {
      let routes: RouteObject[] = [];
      let children: RouteObject[] = [];
      let modules: any[] = [];

      if (isAuthenticated) {
        const token = await getAccessTokenSilently();

        modules = await fetchModules(token);

        const pages = modules.flatMap((module) =>
          module.categories.flatMap(
            (category: { pages: any }) => category.pages
          )
        );

        children = pages.map((p) => {
          const LazyComp = lazyComponents[p.component] ?? NotFound;
          const element = (
            <Suspense fallback={<div>Loading...</div>}>
              <AuthenticatedRoute>
                <LazyComp key={p.pageId} />
              </AuthenticatedRoute>
            </Suspense>
          );

          return {
            path: p.path,
            element,
          };
        });
      }

      children.push({ path: "*", element: <NotFound /> });

      routes = [
        {
          path: "/",
          element: <MainLayout modules={modules ?? []} />,
          children,
        },
      ];

      setRouter(createBrowserRouter(routes));
    };

    setupRoutes();
  }, [isAuthenticated]);

  if (isLoading || !router) return <></>;

  return <RouterProvider router={router} />;
}

export default App;
```
Client: `http://localhost:5173/`
![Alt text](/readme-images/client-navigation.png?raw=true "Client")

# Add Structured Error Handling to the Node.js Server
Create folder `apps/server/src/errors` and inside a custom error class `apps/server/src/errors/aspectError.ts`.
```TypeScript
export class AspectError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

Create folder `apps/server/src/middleware` and inside a create centralized error response middleware class `apps/server/src/middleware/errorHandler.ts`.
```TypeScript
import { Request, Response, NextFunction } from "express";
import { AspectError } from "../errors/aspectError";
import { config } from "../config/config";

export const errorHandler = (
  err: Error | AspectError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err instanceof AspectError ? err.statusCode : 500;
  const message = err.message || "Something went wrong";

  if (config.NODE_ENV !== "production") {
    console.error(`[Error]: ${message}`);
  }

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
```
Create a Async handler wrapper `apps/server/src/middleware/asyncHandler.ts`.
```TypeScript
import { Request, Response, NextFunction } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
```
> [!TIP]
>
> Use a wrapper to avoid repeating try-catch in every async route.

Wrap the request with the `asyncHandler` to avoid repeating try-catch in every async route.
```TypeScript
import { Router, Request, Response, RequestHandler } from "express";
import { Database } from "sqlite";
import { NavigationRow } from "../interfaces/navigationRow";
import { Module } from "shared/src/models/module";
import { Category } from "shared/src/models/category";
import { Page } from "shared/src/models/page";
import { asyncHandler } from "../middleware/asyncHandler"; // 👈 import asyncHandler

export default function createNavigationRoute(db: Database) {
  const router = Router();

  router.get(
    "/",
    asyncHandler(async (_req: Request, res: Response) => {  // 👈 wrap with asyncHandler
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


	// other code removed for brevity...

```

In `apps/server/src/index.ts`, add the error handling middleware last.
```TypeScript
import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler"; // 👈 import errorHandler
import navigationRouter from "./routes/navigation";

// code removed for brevity...

const start = async () => {
  app.use(config.ENDPOINT_NAVIGATION, navigationRouter);

  // handle all exceptions
  app.use(errorHandler); // 👈 add the errorHandler last

  app.listen(config.HOST_PORT, config.HOST_URL, () =>
    console.log(
      `Server running on http://${config.HOST_URL}:${config.HOST_PORT}`
    )
  );
};

start();
```

# Add Logging to the Node.js Server
Install the **Winston** logging library.
```
npm install winston winston-daily-rotate-file
npm install --save-dev @types/winston @types/express
```

Create folder `apps/server/src/logger` and inside create the class `apps/server/src/logger/aspectError.ts`.
```TypeScript
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new DailyRotateFile({
      dirname: "logs",
      filename: "aspect-server-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
      zippedArchive: true,
    }),
    new DailyRotateFile({
      dirname: "logs",
      filename: "errors-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      zippedArchive: true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

export default logger;
```

Update the `errorHandler` at `apps/server/src/middleware/errorHandler.ts` to log all errors.
```TypeScript
import { Request, Response, NextFunction } from "express";
import { AspectError } from "../errors/aspectError";
import { config } from "../config/config";
import logger from "../logger/logger";

export const errorHandler = (
  err: Error | AspectError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (config.NODE_ENV !== "production") {
    console.error(`[Error]: ${message}`);
    message = err.message || message;
    statusCode = err instanceof AspectError ? err.statusCode : 500;
  }

  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
  });

  res.status(statusCode).json({
    status: "error",
    message,
  });
};
```

Update `.gitignore` to ignore the logging output.
```
node_modules
dist
.env.local
.env
*.sqlite
sqlite3.exe
*-audit.json   // 👈 add
*.log   // 👈 add
*.log.gz   // 👈 add
```

# Seed the Authorisation data
Create role data class `db/src/data/roleData.ts`.
```TypeScript
import { Role } from "../../../apps/shared/src/models/role";

export function getRoles() {
  return [
    {
      roleId: 1,
      name: "admin",
      permission: "admin_ro|admin_rw",
      permissions: [
        {
          permissionId: 1,
          name: "admin_ro",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 2,
          name: "admin_rw",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 3,
          name: "auth_rw",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 4,
          name: "auth_ro",
          permission: "admin_ro|admin_rw",
        },
      ],
    },
    {
      roleId: 2,
      name: "auth",
      permission: "admin_ro|admin_rw",
      permissions: [
        {
          permissionId: 3,
          name: "auth_rw",
          permission: "admin_ro|admin_rw",
        },
        {
          permissionId: 4,
          name: "auth_ro",
          permission: "admin_ro|admin_rw",
        },
      ],
    },
  ] as Role[];
}
```
Update `userData` class `db/src/data/userData.ts`.
```TypeScript
import { User } from "../../../apps/shared/src/models/user";
import { Role } from "../../../apps/shared/src/models/role";

export function getUsers(roles: Role[]) {
  let alice = new User(1, "Alice", "alice@email.com", "auth_rw|auth_ro");
  let bob = new User(2, "Bob", "bob@email.com", "auth_rw|auth_ro");

  alice.roles.push(roles[0]); // Assigning 'admin' role to Alice
  bob.roles.push(roles[1]); // Assigning 'auth' role to Bob

  return [alice, bob];
}
```
Create seed authorisation data class `db/src/seedAuthorisation.ts`.
```TypeScript
import { Database } from "sqlite";
import { Role } from "../../apps/shared/src/models/role";
import { Permission } from "../../apps/shared/src/models/permission";

export async function seedAuthorisation(db: Database, roles: Role[]) {
  const permissionsMap = new Map<number, Permission>();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      userId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS roles (
      roleId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS permissions (
      permissionId INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      permission TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE userRoles (
        userId INTEGER,
        roleId INTEGER,
        PRIMARY KEY (userId, roleId),
        FOREIGN KEY (userId) REFERENCES users(userId),
        FOREIGN KEY (roleId) REFERENCES roles(roleId)
    );
  `);

  await db.exec(`
    CREATE TABLE rolePermissions (
        roleId INTEGER,
        permissionId INTEGER,
        PRIMARY KEY (roleId, permissionId),
        FOREIGN KEY (roleId) REFERENCES roles(roleId),
        FOREIGN KEY (permissionId) REFERENCES permissions(permissionId)
    );
  `);

  const roleStatement = await db.prepare(
    "INSERT INTO roles (roleId, name, permission) VALUES (?, ?, ?)"
  );

  const permissionStatement = await db.prepare(
    "INSERT INTO permissions (permissionId, name, permission) VALUES (?, ?, ?)"
  );

  const rolePermissionStatement = await db.prepare(
    "INSERT INTO rolePermissions (roleId, permissionId) VALUES (?, ?)"
  );

  for (const role of roles) {
    await roleStatement.run(role.roleId, role.name, role.permission);
    console.log(`Inserted: ${role.name}`);

    for (const permission of role.permissions) {
      let p = permissionsMap.get(permission.permissionId);
      if (!p) {
        await permissionStatement.run(
          permission.permissionId,
          permission.name,
          permission.permission
        );
        console.log(`Inserted: ${permission.name}`);

        permissionsMap.set(permission.permissionId, permission);
      }

      await rolePermissionStatement.run(role.roleId, permission.permissionId);
      console.log(
        `Inserted: roleId ${role.roleId}, permissionId ${permission.permissionId}`
      );
    }
  }

  roleStatement.finalize();
  permissionStatement.finalize();
  rolePermissionStatement.finalize();

  console.log(`Insert Authorisation Complete.`);
}
```
Change seed users data class `db/src/seedUsers.ts`.
```TypeScript
import { Database } from "sqlite";
import { User } from "../../apps/shared/src/models/user";

export async function seedUsers(db: Database, users: User[]) {
  const userStatement = await db.prepare(
    "INSERT INTO users (userId, name, email, permission) VALUES (?, ?, ?, ?)"
  );

  const userRoleStatement = await db.prepare(
    "INSERT INTO userRoles (userId, roleId) VALUES (?, ?)"
  );

  for (const user of users) {
    await userStatement.run(
      user.userId,
      user.name,
      user.email,
      user.permission
    );
    console.log(`Inserted: ${user.name}`);

    for (const role of user.roles) {
      await userRoleStatement.run(user.userId, role.roleId);
      console.log(`Inserted: userId ${user.userId}, roleId ${role.roleId}`);
    }
  }

  userStatement.finalize();
  userRoleStatement.finalize();

  console.log(`Insert Users Complete.`);
}
```
Update seed class class `db/src/seed.ts`.
```TypeScript
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedUsers } from "./seedUsers";
import { getUsers } from "./data/userData";
import { seedModules } from "./seedModules";
import { getModules } from "./data/moduleData";
import { getRoles } from "./data/roleData"; // 👈 add
import { seedAuthorisation } from "./seedAuthorisation"; // 👈 add
const fs = require("fs");

sqlite3.verbose();

async function seed() {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });

  if (!process.env.DATABASE) {
    throw new Error("DATABASE environment variable is not set");
  }

  let dbFile = process.env.DATABASE;

  if (fs.existsSync(dbFile)) {
    fs.unlinkSync(dbFile);
    console.log(`Existing database deleted ${dbFile}`);
  }

  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database,
  });

  let modules = getModules();
  let roles = getRoles(); // 👈 add
  let users = getUsers(roles); // 👈 modify

  await seedModules(db, modules);
  await seedAuthorisation(db, roles); // 👈 add
  await seedUsers(db, users);

  await db.close();
  console.log(`Database seeding complete: ${dbFile}`);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
```

# Add API Endpoints
## Create Endpoint Variables in `.env` File
Update the server's `apps/server/.env` with the permissions endpoint.
```
HOST_URL=localhost
HOST_PORT=3000
AUTH_AUDIENCE=https://Aspect.API.com 	
AUTH_ISSUER_BASE_URL=https:		
AUTH_TOKEN_SIGNING_ALGORITHM=RS256 	
CORS_URL=http://localhost:5173
ENDPOINT_NAVIGATION=/api/navigation

// 👇 new variables
ENDPOINT_NAVIGATION=/api/permissions
ENDPOINT_ROLES=/api/roles
ENDPOINT_ROLES=/api/roles
ENDPOINT_USERS=/api/users
ENDPOINT_PAGES=/api/pages
ENDPOINT_CATEGORIES=/api/categories
ENDPOINT_MODULES=/api/modules
// 👆 new variables

```

## Add the Authorisation Endpoints
Create the `permissions` route `apps/server/src/route/permissions.ts`.
```TypeScript
import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Permission } from "shared/src/models/permission";
import { permissionSchema } from "shared/src/validation/permissionSchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Permission[] = await db.all(`
      SELECT    permissionId, name, permission  
      FROM 	    permissions
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Permission>(
      `
      SELECT    permissionId, name, permission  
      FROM 	    permissions
      WHERE     permissionId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Permission not found" });

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = permissionSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO permissions (name, permission) VALUES (?, ?)",
      [name, permission]
    );

    res.status(201).json({ permissionId: result.lastID, name, permission });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = permissionSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "UPDATE permissions SET name = ?, permission = ? WHERE permissionId = ?",
      [name, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }

    res.json({ permissionId: _req.params.id, name, permission });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.run(
      "DELETE FROM permissions WHERE permissionId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Permission not found" });
    }

    res.status(204).send();
  })
);

export default router;
```

Create the `roles` route `apps/server/src/route/roles.ts`.
```TypeScript
import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Role } from "shared/src/models/role";
import { Permission } from "shared/src/models/permission";
import { RolePermission } from "shared/src/interfaces/rolePermission";
import { roleSchema } from "shared/src/validation/roleSchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Role[] = await db.all(`
      SELECT    roleId, name, permission  
      FROM 	    roles
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Role>(
      `
      SELECT    roleId, name, permission  
      FROM 	    roles
      WHERE     roleId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Role not found" });

    const permissions: Permission[] = await db.all(
      `
      SELECT        p.permissionId, p.name, p.permission  
      FROM 	        rolePermissions rp
      INNER JOIN    permissions p ON rp.permissionId = p.permissionId
      WHERE         rp.roleId = ?
    `,
      _req.params.id
    );

    result.permissions = permissions;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = roleSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO roles (name, permission) VALUES (?, ?)",
      [name, permission]
    );

    const rolePermissionsStatement = await db.prepare(
      "INSERT INTO rolePermissions (roleId, permissionId) VALUES (?, ?)"
    );

    for (const permission of _req.body.permissions || []) {
      await rolePermissionsStatement.run(
        result.lastID,
        permission.permissionId
      );
    }

    const permissions: Permission[] = await db.all(
      `
      SELECT        p.permissionId, p.name, p.permission  
      FROM 	        rolePermissions rp
      INNER JOIN    permissions p ON rp.permissionId = p.permissionId
      WHERE         rp.roleId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      roleId: result.lastID,
      name,
      permission,
      permissions: permissions,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = roleSchema.safeParse(_req.body);

    let permissions: Permission[] = _req.body.permissions || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE roles SET name = ?, permission = ? WHERE roleId = ?",
      [name, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    const rolePermissions: RolePermission[] = await db.all(
      `
      SELECT roleId, permissionId  
      FROM 	 rolePermissions
      WHERE  roleId = ?
    `,
      _req.params.id
    );

    const rolePermissionsInsertStatement = await db.prepare(
      "INSERT INTO rolePermissions (roleId, permissionId) VALUES (?, ?)"
    );

    const rolePermissionsDeleteStatement = await db.prepare(
      "DELETE FROM rolePermissions WHERE roleId = ? AND permissionId = ?"
    );

    for (const permission of permissions || []) {
      if (
        !rolePermissions.find((p) => p.permissionId === permission.permissionId)
      ) {
        rolePermissionsInsertStatement.run(
          _req.params.id,
          permission.permissionId
        );
      }
    }

    for (const rolePermission of rolePermissions || []) {
      if (
        !permissions.find((p) => p.permissionId === rolePermission.permissionId)
      ) {
        rolePermissionsDeleteStatement.run(
          rolePermission.roleId,
          rolePermission.permissionId
        );
      }
    }

    permissions = await db.all(
      `
      SELECT        p.permissionId, p.name, p.permission  
      FROM 	        rolePermissions rp
      INNER JOIN    permissions p ON rp.permissionId = p.permissionId
      WHERE         rp.roleId = ?
    `,
      _req.params.id
    );

    res.json({
      roleId: _req.params.id,
      name: name,
      permission: permission,
      permissions: permissions,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run(
      "DELETE FROM rolePermissions WHERE roleId = ?",
      _req.params.id
    );

    const result = await db.run(
      "DELETE FROM roles WHERE roleId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(204).send();
  })
);

export default router;
```

Create the `users` route `apps/server/src/route/users.ts`.
```TypeScript
import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { User } from "shared/src/models/user";
import { Role } from "shared/src/models/role";
import { UserRole } from "shared/src/interfaces/userRole";
import { userSchema } from "shared/src/validation/userSchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: User[] = await db.all(`
      SELECT    userId, name, email, permission  
      FROM 	    users
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<User>(
      `
      SELECT    userId, name, email, permission  
      FROM 	    users
      WHERE     userId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "User not found" });

    const roles: Role[] = await db.all(
      `
      SELECT        r.roleId, r.name, r.permission  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      _req.params.id
    );

    result.roles = roles;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = userSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, email, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO users (name, email, permission) VALUES (?, ?, ?)",
      [name, email, permission]
    );

    const userRolesStatement = await db.prepare(
      "INSERT INTO userRoles (userId, roleId) VALUES (?, ?)"
    );

    for (const role of _req.body.roles || []) {
      await userRolesStatement.run(result.lastID, role.roleId);
    }

    const roles: Role[] = await db.all(
      `
      SELECT        r.roleId, r.name, r.permission  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      roleId: result.lastID,
      name: name,
      email: email,
      permission: permission,
      roles: roles,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = userSchema.safeParse(_req.body);

    let roles: Role[] = _req.body.roles || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, email, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE users SET name = ?, email = ?, permission = ? WHERE userId = ?",
      [name, email, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userRoles: UserRole[] = await db.all(
      `
      SELECT userId, roleId  
      FROM 	 userRoles
      WHERE  userId = ?
    `,
      _req.params.id
    );

    const userRolesInsertStatement = await db.prepare(
      "INSERT INTO userRoles (userId, roleId) VALUES (?, ?)"
    );

    const userRolesDeleteStatement = await db.prepare(
      "DELETE FROM userRoles WHERE userId = ? AND roleId = ?"
    );

    for (const role of roles || []) {
      if (!userRoles.find((r) => r.roleId === role.roleId)) {
        userRolesInsertStatement.run(_req.params.id, role.roleId);
      }
    }

    for (const userRole of userRoles || []) {
      if (!roles.find((r) => r.roleId === userRole.roleId)) {
        userRolesDeleteStatement.run(userRole.userId, userRole.roleId);
      }
    }
    roles = await db.all(
      `
      SELECT        r.roleId, r.name, r.permission  
      FROM 	        userRoles ur
      INNER JOIN    roles r ON ur.roleId = r.roleId
      WHERE         ur.userId = ?
    `,
      _req.params.id
    );

    res.json({
      roleId: _req.params.id,
      name: name,
      email: email,
      permission: permission,
      roles: roles,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run("DELETE FROM userRoles WHERE userId = ?", _req.params.id);

    const result = await db.run(
      "DELETE FROM users WHERE userId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(204).send();
  })
);

export default router;
```

## Add the Applications Endpoints
Create the `pages` route `apps/server/src/route/pages.ts`.
```TypeScript
import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Page } from "shared/src/models/page";
import { pageSchema } from "shared/src/validation/pageSchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Page[] = await db.all(`
      SELECT    pageId, name, icon, url, permission  
      FROM 	    pages
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Page>(
      `
      SELECT    pageId, name, icon, url, permission  
      FROM 	    pages
      WHERE     pageId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Page not found" });

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = pageSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, url, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO pages (name, icon, url, permission) VALUES (?, ?, ?, ?)",
      [name, icon, url, permission]
    );

    res
      .status(201)
      .json({ pageId: result.lastID, name, icon, url, permission });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = pageSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, url, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "UPDATE pages SET name = ?, icon = ?, url = ?, permission = ? WHERE pageId = ?",
      [name, icon, url, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json({ pageId: _req.params.id, name, icon, url, permission });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.run(
      "DELETE FROM pages WHERE pageId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.status(204).send();
  })
);

export default router;
```

Create the `categories` route `apps/server/src/route/categories.ts`.
```TypeScript
import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Category } from "shared/src/models/category";
import { Page } from "shared/src/models/page";
import { CategoryPage } from "shared/src/interfaces/categoryPage";
import { categorySchema } from "shared/src/validation/categorySchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Category[] = await db.all(`
      SELECT    categoryId, name, icon, permission  
      FROM 	    categories
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Category>(
      `
      SELECT    categoryId, name, icon, permission  
      FROM 	    categories
      WHERE     categoryId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "Category not found" });

    const pages: Page[] = await db.all(
      `
      SELECT        p.pageId, p.name, p.icon, p.url, p.permission 
      FROM 	        categoryPages cp
      INNER JOIN    pages p ON cp.pageId = p.pageId
      WHERE         cp.categoryId = ?
    `,
      _req.params.id
    );

    result.pages = pages;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = categorySchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO categories (name, icon, permission) VALUES (?, ?, ?)",
      [name, icon, permission]
    );

    const categoryPageStatement = await db.prepare(
      "INSERT INTO categoryPages (categoryId, pageId) VALUES (?, ?)"
    );

    for (const page of _req.body.pages || []) {
      await categoryPageStatement.run(result.lastID, page.pageId);
    }

    const pages: Page[] = await db.all(
      `
      SELECT        p.pageId, p.name, p.icon, p.url, p.permission 
      FROM 	        categoryPages cp
      INNER JOIN    pages p ON cp.pageId = p.pageId
      WHERE         cp.categoryId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      categoryId: result.lastID,
      name: name,
      icon: icon,
      permission: permission,
      pages: pages,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = categorySchema.safeParse(_req.body);

    let pages: Page[] = _req.body.pages || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE categories SET name = ?, icon = ?, permission = ? WHERE categoryId = ?",
      [name, icon, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    const categoryPages: CategoryPage[] = await db.all(
      `
      SELECT categoryId, pageId  
      FROM 	 categoryPages
      WHERE  categoryId = ?
    `,
      _req.params.id
    );

    const categoryPagesInsertStatement = await db.prepare(
      "INSERT INTO categoryPages (categoryId, pageId) VALUES (?, ?)"
    );

    const categoryPagesDeleteStatement = await db.prepare(
      "DELETE FROM categoryPages WHERE categoryId = ? AND pageId = ?"
    );

    for (const page of pages || []) {
      if (!categoryPages.find((p) => p.pageId === page.pageId)) {
        categoryPagesInsertStatement.run(_req.params.id, page.pageId);
      }
    }

    for (const categoryPage of categoryPages || []) {
      if (!pages.find((p) => p.pageId === categoryPage.pageId)) {
        categoryPagesDeleteStatement.run(
          categoryPage.categoryId,
          categoryPage.pageId
        );
      }
    }

    pages = await db.all(
      `
      SELECT        p.pageId, p.name, p.icon, p.url, p.permission 
      FROM 	        categoryPages cp
      INNER JOIN    pages p ON cp.pageId = p.pageId
      WHERE         cp.categoryId = ?
    `,
      _req.params.id
    );

    res.json({
      categoryId: _req.params.id,
      name: name,
      icon: icon,
      permission: permission,
      pages: pages,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run(
      "DELETE FROM categoryPages WHERE categoryId = ?",
      _req.params.id
    );

    const result = await db.run(
      "DELETE FROM categories WHERE categoryId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.status(204).send();
  })
);

export default router;
```

Create the `modules` route `apps/server/src/route/modules.ts`.
```TypeScript
import path from "path";
import dotenv from "dotenv";
import { Router, Request, Response, RequestHandler } from "express";
import { dbConnection } from "../data/db";
import { Module } from "shared/src/models/module";
import { Category } from "shared/src/models/category";
import { ModuleCategory } from "shared/src/interfaces/moduleCategory";
import { moduleSchema } from "shared/src/validation/moduleSchema";
import { asyncHandler } from "../middleware/asyncHandler";
import { config } from "../config/config";

const dbFile = path.resolve(__dirname, config.DATABASE);

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result: Module[] = await db.all(`
      SELECT    moduleId, name, icon, permission  
      FROM 	    modules
    `);

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);
    const result = await db.get<Module>(
      `
      SELECT    moduleId, name, icon, permission  
      FROM 	    modules
      WHERE     moduleId = ?
    `,
      _req.params.id
    );

    if (!result) return res.status(404).json({ error: "module not found" });

    const categories: Category[] = await db.all(
      `
      SELECT        c.categoryId, c.name, c.icon, c.permission  
      FROM 	        moduleCategories mc
      INNER JOIN    categories c ON mc.categoryId = c.categoryId
      WHERE         mc.moduleId = ?
    `,
      _req.params.id
    );

    result.categories = categories;

    res.json(result);
  })
);

router.post(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = moduleSchema.safeParse(_req.body);

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);
    const result = await db.run(
      "INSERT INTO modules (name, icon, permission) VALUES (?, ?, ?)",
      [name, icon, permission]
    );

    const moduleCategoryStatement = await db.prepare(
      "INSERT INTO moduleCategories (moduleId, categoryId) VALUES (?, ?)"
    );

    for (const category of _req.body.categories || []) {
      await moduleCategoryStatement.run(result.lastID, category.categoryId);
    }

    const categories: Category[] = await db.all(
      `
      SELECT        c.categoryId, c.name, c.icon, c.permission  
      FROM 	        moduleCategories mc
      INNER JOIN    categories c ON mc.categoryId = c.categoryId
      WHERE         mc.moduleId = ?
    `,
      result.lastID
    );

    res.status(201).json({
      moduleId: result.lastID,
      name: name,
      icon: icon,
      permission: permission,
      categories: categories,
    });
  })
);

router.put(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const parsed = moduleSchema.safeParse(_req.body);

    let categories: Category[] = _req.body.categories || [];

    if (!parsed.success) {
      return res
        .status(400)
        .json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { name, icon, permission } = parsed.data;

    const db = await dbConnection(dbFile);

    const result = await db.run(
      "UPDATE modules SET name = ?, icon = ?, permission = ? WHERE moduleId = ?",
      [name, icon, permission, _req.params.id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Module not found" });
    }

    const moduleCategories: ModuleCategory[] = await db.all(
      `
      SELECT moduleId, categoryId  
      FROM 	 moduleCategories
      WHERE  moduleId = ?
    `,
      _req.params.id
    );

    const moduleCategoryInsertStatement = await db.prepare(
      "INSERT INTO moduleCategories (moduleId, categoryId) VALUES (?, ?)"
    );

    const moduleCategoryDeleteStatement = await db.prepare(
      "DELETE FROM moduleCategories WHERE moduleId = ? AND categoryId = ?"
    );

    for (const category of categories || []) {
      if (
        !moduleCategories.find((mc) => mc.categoryId === category.categoryId)
      ) {
        moduleCategoryInsertStatement.run(_req.params.id, category.categoryId);
      }
    }

    for (const moduleCategory of moduleCategories || []) {
      if (
        !categories.find((mc) => mc.categoryId === moduleCategory.categoryId)
      ) {
        moduleCategoryDeleteStatement.run(
          moduleCategory.moduleId,
          moduleCategory.categoryId
        );
      }
    }

    categories = await db.all(
      `
      SELECT        c.categoryId, c.name, c.icon, c.permission  
      FROM 	        moduleCategories mc
      INNER JOIN    categories c ON mc.categoryId = c.categoryId
      WHERE         mc.moduleId = ?
    `,
      _req.params.id
    );

    res.json({
      moduleId: _req.params.id,
      name: name,
      icon: icon,
      permission: permission,
      categories: categories,
    });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (_req: Request, res: Response) => {
    const db = await dbConnection(dbFile);

    await db.run(
      "DELETE FROM moduleCategories WHERE moduleId = ?",
      _req.params.id
    );

    const result = await db.run(
      "DELETE FROM modules WHERE moduleId = ?",
      _req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.status(204).send();
  })
);

export default router;
```

## Update the `index.ts`
Update the `apps/server/src/index.ts`
```TypeScript
// code removed for brevity...

import navigationRouter from "./routes/navigation";

// 👇 import new routers
import permissionsRouter from "./routes/permissions";
import rolesRouter from "./routes/roles";
import usersRouter from "./routes/users";
import pagesRouter from "./routes/pages";
import categoriesRouter from "./routes/categories";
import modulesRouter from "./routes/modules";
// 👆 import new routers

// code removed for brevity...

const start = async () => {
  const jwtCheck = auth({
    audience: config.AUTH_AUDIENCE,
    issuerBaseURL: config.AUTH_ISSUER_BASE_URL,
    tokenSigningAlg: config.AUTH_TOKEN_SIGNING_ALGORITHM,
  });

  // code removed for brevity...

  app.use(navigationEndpoint, navigationRouter);

  // 👇 add new routes
  app.use(config.ENDPOINT_PERMISSIONS, permissionsRouter);
  app.use(config.ENDPOINT_ROLES, rolesRouter);
  app.use(config.ENDPOINT_USERS, usersRouter);
  app.use(config.ENDPOINT_PAGES, pagesRouter);
  app.use(config.ENDPOINT_CATEGORIES, categoriesRouter);
  app.use(config.ENDPOINT_MODULES, modulesRouter);
  // 👆 add new routes

  // code removed for brevity...
};

start();
```

# Test the Endpoints using Postman
To test an API that uses Auth0 token authentication in Postman, you need to first obtain a valid access token from Auth0, then include it in the Authorization header of your API requests.

1. Set Up a Machine-to-Machine Application in Auth0
- Go to your Auth0 dashboard.
- Navigate to Applications > Applications.
- Create or select a Machine to Machine app.
- Under APIs, authorize it to access your API (you may need to create an API under Applications > APIs if it doesn't exist yet).

2. Get an Access Token Using Postman
In Postman, create a new POST request to Auth0’s token endpoint:
```
https://YOUR_DOMAIN/oauth/token
```
Set the body type to `x-www-form-urlencoded` and include the following key\value pairs:
| Key             | Value                       |
| --------------- | --------------------------- |
| `grant_type`    | `client_credentials`        |
| `client_id`     | (from your Auth0 app)       |
| `client_secret` | (from your Auth0 app)       |
| `audience`      | (your Auth0 API identifier) |

Send the request. You’ll get a response like this:
```json
{
  "access_token": "eyJz93a...k4laUWw",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

3. Use the Access Token to Call Your API
Create a new request to your API endpoint e.g., `http://localhost:3000/api/permissions`

Go to the Authorization tab in Postman and set:
- Type: `Bearer Token`
- Token: Paste the access_token you received earlier.

Send the request!

# Create a Generic DataTable Component
Combine `shadcn`'s `<Table />` component with `@tanstack/react-table` to create tables with sorting, filtering and pagination.

Add the `<Table />` component and install `tanstack/react-table`.
```
npx shadcn@latest add table

npm install @tanstack/react-table
```

> [!Caution]
> 
> Installing the shadcn/ui table came with two unexpected issues that needed to be resolved.
> 
> ```
> aspect/
> ├── src/components/ui/table.tsx   👈 move table.tsx into apps/client/src/components/ui then delete this
> │   
> └── apps/client/src/components/ui/table.tsx 👈 move table.tsx to here
> ```

Create request `apps/client/src/requests/fetch-generic-record-data.ts`.
```TypeScript
import { config } from "@/config/config";

export async function fetchGenericRecordData(
  token: string,
  path: string
): Promise<Record<string, unknown>[]> {
  const url = `${config.API_URL}/api${path}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  return data;
}
```

Create component `apps/client/src/components/table/data-table.tsx`.
```TypeScript
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-left">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
```

Update the page `apps/client/src/pages/generic-data-table.tsx`.
```TypeScript
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { type ColumnDef } from "@tanstack/react-table";
import { useAuth0 } from "@auth0/auth0-react";
import { DataTable } from "@/components/table/data-table";
import { fetchGenericRecordData } from "@/requests/fetch-generic-record-data";

type RawRow = Record<string, unknown>; // We don't know the shape yet

export default function GenericDataTable() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const location = useLocation();
  const [data, setData] = useState<RawRow[]>([]);
  const [columns, setColumns] = useState<ColumnDef<RawRow>[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        const json = await fetchGenericRecordData(token, location.pathname);

        // Dynamically infer column definitions from the first row
        const keys = Object.keys(json[0] ?? {});

        const inferredColumns: ColumnDef<RawRow>[] = keys.map((key) => ({
          accessorKey: key,
          header: key.toUpperCase(),
          cell: (info) => String(info.getValue() ?? ""),
        }));

        setData(json);
        setColumns(inferredColumns);
      }
    };

    fetchData();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="container mx-auto py-10 px-4">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
```

# Add Dynamic Route Loading
> [!WARNING]
>
> This section will require significant refactoring of `App.tsx`.

Create the `apps/client/src/router.ts`.
```TS
import { createBrowserRouter } from "react-router-dom";
import React from "react";
import App from "./App";

export const router = createBrowserRouter([
  {
    path: "*",
    element: React.createElement(App),  // 👈 create the App element
  },
]);
```

Modify `apps/client/src/main.tsx`.
```TypeScript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom"; // 👈 import RouterProvider
import { Auth0Provider } from "@auth0/auth0-react";
import { config } from "@/config/config";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { router } from "./router"; // 👈 import router
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="aspect-ui-theme">
      <Auth0Provider
        domain={config.AUTH0_DOMAIN}
        clientId={config.AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: config.AUTH0_AUDIENCE || undefined,
        }}
        onRedirectCallback={(appState) => { { /* 👈 onRedirectCallback uses the router’s own navigate */ }
          router.navigate(appState?.returnTo || window.location.pathname);
        }}
      >
        <RouterProvider router={router} /> { /* 👈 bring RouterProvider to root level in main.tsx */ }
      </Auth0Provider>
    </ThemeProvider>
  </StrictMode>
);
```

Refactor `apps/client/src/App.tsx`.
```TSX
import { Suspense, useEffect, useState } from "react";
import { Route, Routes, type RouteObject } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthenticatedRoute } from "@/auth/authenticated-route";
import { fetchLazyComponents } from "@/utils/fetch-lazy-components";
import { fetchModules } from "@/requests/fetch-modules";
import { Module } from "shared/src/models/module";
import NotFound from "./pages/not-found";
import "./App.css";

const lazyComponents = fetchLazyComponents();

// 👇 Function to render routes based on the fetched modules
function renderRoutes(routeObjects: RouteObject[]) {
  return routeObjects.map((r, i) => {
    return <Route key={i} path={r.path} element={r.element} />;
  });
}

function App() {
  const { getAccessTokenSilently, isAuthenticated, isLoading, user } =
    useAuth0();
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    const loadRoutes = async () => {
      let apiRoutes: RouteObject[] = [];
      let apiModules: Module[] = [];

      if (isAuthenticated && user?.sub) {
        const token = await getAccessTokenSilently();

        apiModules = await fetchModules(token);

        setModules(apiModules);

        const pages = apiModules.flatMap((module) =>
          module.categories.flatMap(
            (category: { pages: any }) => category.pages
          )
        );

        apiRoutes = pages.map((p) => {
          const LazyComp = lazyComponents[p.component] ?? NotFound;
          const element = (
            <Suspense fallback={<div>Loading...</div>}>
              <AuthenticatedRoute>
                <LazyComp key={p.pageId} />
              </AuthenticatedRoute>
            </Suspense>
          );

          return {
            path: p.path,
            element,
          };
        });

        routes.push({ path: "*", element: <NotFound /> });

        setRoutes(apiRoutes); // 👈 Set the routes based on fetched modules
        setModules(apiModules); // 👈 Set the modules based on fetched data
      } else if (!isLoading && !isAuthenticated) {
        setRoutes([]);
        setModules([]);
      }
    };

    loadRoutes();
  }, [isAuthenticated, getAccessTokenSilently, user]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout modules={modules ?? []} />}>
        {renderRoutes(routes)}{" "}
        {/* 👆 Render dynamic routes based on fetched modules */}
      </Route>
    </Routes>
  );
}

export default App;
```

**Why this works**
- **Only one router `<RouterProvider>` is used at the root level `main.tsx`.**
- **The `Auth0Provider` sits above the router so all routes can access authentication context.**
- **`Auth0Provider`'s `onRedirectCallback` uses the router’s own `navigate` to keep the SPA session history intact after login/logout redirects.**
