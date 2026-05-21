# frontend/vite.config.js

## 1. Overview
`frontend/vite.config.js` configures the Vite bundler, defining compilation plugins, CSS configurations, and build behavior for the frontend.

## 2. Key Responsibilities & Flow
- Imports `defineConfig` from `vite`, the standard `@vitejs/plugin-react` plugin, and the `@tailwindcss/vite` plugin.
- **`plugins`**: Resolves JSX/React modules (`react()`) and registers Tailwind CSS v4 styling compilations (`tailwindcss()`).

## 3. Code Patterns & Best Practices
- **Declarative Bundling Config**: Centralizes compiler configurations in a single file utilizing helper exports for auto-completion support.
- **Tailwind v4 Integration**: Uses the official Vite plugin for Tailwind v4, removing the need for a separate `postcss.config.js` or `tailwind.config.js` file.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Compiles the React SPA assets which perform requests targeting the backend server routes.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Module Imports**: Imports configuration utilities and plugins from Vite, React plugin, and Tailwind CSS.
2. **Vite Configuration Object**: Configures plugins to build React and process Tailwind styles.

- **Lines 1-3 (Module Imports)**:
  - **Basic Function**: Imports compiler config and compiler extension plugins.
  - **Detailed Explanation**: Imports `defineConfig` from Vite to provide type definitions/autocomplete, `@vitejs/plugin-react` to enable Fast Refresh and JSX translation, and `@tailwindcss/vite` for Tailwind CSS processing.
- **Lines 5-9 (Vite Configuration Object)**:
  - **Basic Function**: Declares and exports the configuration object.
  - **Detailed Explanation**: Uses `defineConfig()` to export the configuration. Registers `react()` and `tailwindcss()` inside the `plugins` array to enable React JSX rendering/Fast Refresh and Tailwind compilation.
