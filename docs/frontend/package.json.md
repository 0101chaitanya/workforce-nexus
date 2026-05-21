# frontend/package.json

## 1. Overview
`frontend/package.json` configures the frontend project's package name, scripts, dependencies, devDependencies, and module configurations.

## 2. Key Responsibilities & Flow
- **Package Scripts**:
  - `npm run dev`: Starts the local development server (Vite).
  - `npm run build`: Bundles assets for production into the `dist/` directory.
  - `npm run lint`: Runs ESLint on the codebase to check for style violations.
  - `npm run preview`: Locally previews the production build.
- **Dependencies**:
  - **React 19 (`react`, `react-dom`)**: Standard user interface framework.
  - **React Router Dom (`react-router-dom`)**: Controls app routing, history stacks, and protective guards.
  - **Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)**: Manages global application state (e.g., auth, current user, cache).
  - **Axios**: HTTP client equipped with interceptors for token refresh cycles.
  - **Lucide React**: Vector icon library.
  - **TailwindCSS (`tailwindcss`, `@tailwindcss/vite`)**: CSS framework for styling components.

## 3. Code Patterns & Best Practices
- **ES Module Architecture**: Uses `"type": "module"` to write standard modern ES imports/exports instead of CommonJS.
- **Tailwind CSS v4 Integration**: Uses `@tailwindcss/vite` for CSS compilation and build optimizations.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Declares the frontend runtime environment, providing the script triggers to build and run the client-side app which interfaces with the Node.js backend.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Project Metadata**: Declares project name, privacy, version, and module type settings.
2. **Scripts configuration**: Defines CLI commands for running development, building, linting, and previewing.
3. **Runtime Dependencies**: Enumerates the production packages required for application state, routing, styling, icon rendering, and network requests.
4. **Development Dependencies**: Lists compiler, tooling, typing, and linting libraries needed only during development.

- **Lines 1-5 (Project Metadata)**:
  - **Basic Function**: Basic metadata configuration of the frontend project.
  - **Detailed Explanation**: Sets package name to `"vite-project"`, marks it as `"private": true`, sets version to `"0.0.0"`, and specifies `"type": "module"` to use ES6 modules throughout the directory.
- **Lines 6-11 (Scripts configuration)**:
  - **Basic Function**: Defines terminal scripts for development and deployment.
  - **Detailed Explanation**: Maps `"dev"` to `vite`, `"build"` to `vite build` for production packaging, `"lint"` to `eslint .` to run code analysis, and `"preview"` to `vite preview` to serve the local build.
- **Lines 12-22 (Runtime Dependencies)**:
  - **Basic Function**: Declares libraries required during application runtime.
  - **Detailed Explanation**: Lists state management tools `@reduxjs/toolkit` and `react-redux`, `@tailwindcss/vite` and `tailwindcss` for styling, `axios` for API calls, `lucide-react` for icons, and React v19 libraries (`react`, `react-dom`) and `react-router-dom` for routing.
- **Lines 23-34 (Development Dependencies)**:
  - **Basic Function**: Declares helper packages for compiling, checking type declarations, and linting.
  - **Detailed Explanation**: Includes ESLint packages (`@eslint/js`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`), React types for TypeScript/IDE assistance, the Vite React plugin (`@vitejs/plugin-react`), and the core `vite` build tool.
