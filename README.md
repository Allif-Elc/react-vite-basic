# API Documentation Platform - Frontend

Frontend application for the API Documentation Platform built with React, Vite, TypeScript, and pnpm.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Zustand** - State management
- **Axios** - HTTP client
- **pnpm** - Package manager

## Project Structure

```
web/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # Reusable UI components
│   │   ├── forms/           # Form components
│   │   ├── editors/         # API editors (REST, GraphQL, gRPC)
│   │   ├── viewers/         # Documentation viewers
│   │   └── layout/          # Layout components
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Project list
│   │   ├── CreateProject.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── EditorREST.tsx   # REST API editor
│   │   ├── EditorGraphQL.tsx
│   │   ├── EditorGRPC.tsx
│   │   ├── Viewer.tsx       # Public documentation viewer
│   │   └── Login.tsx
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API service calls
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── stores/              # Zustand stores
│   ├── App.tsx              # Root component with routes
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── index.html

```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Server runs on http://localhost:5173
```

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Linting

```bash
# Run ESLint
pnpm lint

# Fix ESLint errors
pnpm lint:fix
```

## API Configuration

Create a `.env` file in the root directory:

```bash
VITE_API_URL=http://localhost:8080
```

## Key Features

### Pages

1. **Dashboard** - List all projects with search and filtering
2. **Create Project** - Form to create new projects
3. **Project Detail** - View project details and APIs
4. **REST API Editor** - Create/edit REST API documentation
5. **GraphQL API Editor** - Create/edit GraphQL API documentation
6. **gRPC API Editor** - Create/edit gRPC API documentation
7. **Viewer** - Public documentation viewer (no auth required)
8. **Login** - Authentication page

### Components

- **UI Components** - Reusable components (Button, Input, Modal, etc.)
- **Form Components** - Form-specific components with React Hook Form
- **Editor Components** - API-specific editors (REST, GraphQL, gRPC)
- **Viewer Components** - Documentation display components
- **Layout Components** - Header, Sidebar, Footer

## State Management

Using Zustand for global state:
- Auth store - User authentication state
- Project store - Active project state
- Notification store - Toast notifications

## Forms

All forms use:
- **React Hook Form** - Form state and validation
- **Zod** - Schema validation
- **@hookform/resolvers** - Integration between RHF and Zod

## Routing

Protected routes require authentication. Public routes:
- `/login`
- `/docs/:slug` (public documentation viewer)

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS variables** - For theming (light/dark mode support)

## TypeScript

Strict TypeScript configuration with:
- Path aliases (`@/*` maps to `./src/*`)
- Strict mode enabled
- No unused locals/parameters

## ESLint

Configured with:
- TypeScript ESLint rules
- React Hooks rules
- Custom rules for this project

## Build Output

Production build outputs to `dist/` directory.

## Proxy Configuration

Vite dev server proxies API requests to backend:
- `/api/*` → `http://localhost:8080/api/*`
- `/docs/*` → `http://localhost:8080/docs/*`
