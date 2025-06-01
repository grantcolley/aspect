# aspect

##### A monorepo using npm workspaces, consisting of:
###### client: React + Vite + TypeScript + shadcn/ui + react-router + react-hook-form + zod
###### server: Node.js + Express + TypeScript + SQLite
###### shared: TypeScript-only package with shared types and utilities
#####  

The project structure looks like this:
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

Create subfolder `src`, and create a `shared/src/index.ts` file an example shared class `User`.
```TypeScript
export interface User {
  id: number;
  name: string;
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

Install `shadcn/ui`:
```bash
npx shadcn@latest init
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
![Alt text](/readme-images/client.png?raw=true "Client")


