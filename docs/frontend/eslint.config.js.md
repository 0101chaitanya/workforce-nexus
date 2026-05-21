# frontend/eslint.config.js

## 1. Overview
`frontend/eslint.config.js` sets up ESLint linting rules and static analysis configurations for JavaScript and React files in the frontend repository.

## 2. Key Responsibilities & Flow
- Imports configuration helpers from `@eslint/js`, `globals`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`.
- **`globalIgnores`**: Prevents linting operations from running on the compiled `dist/` directory.
- Matches all files ending in `.js` or `.jsx` and applies recommended JS rules, React hook rules, and Vite-specific React refresh parameters.
- Exposes `globals.browser` to prevent linter errors for built-in browser objects (like `window`, `document`, and `localStorage`).

## 3. Code Patterns & Best Practices
- **Flat Config Format**: Employs the modern ESLint flat config structure (`defineConfig([])`) for declarative lint rules.
- **EcmaFeatures Configuration**: Sets `jsx: true` to support checking JSX nodes without syntax errors.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Validates code quality and consistency on the frontend code before it initiates network requests or processes payloads to/from the backend API.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **ESLint Plugin and Utility Imports**: Imports JS core configs, environment globals, React Hooks guidelines, React Refresh Vite setups, and configuration definition utilities from ESLint.
2. **Build Ignores**: Tells the linter to skip files inside the production `dist` directory.
3. **Linter Target & Config Rules**: Configures targeted file extensions, extends standard JS and React recommendations, sets global runtime targets, and configures JSX support.

- **Lines 1-5 (ESLint Plugin and Utility Imports)**:
  - **Basic Function**: Imports the libraries and helpers required to define the linter configurations.
  - **Detailed Explanation**: Imports `@eslint/js` for standard rules, `globals` to identify built-in global objects, `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` for React developer conventions, and config helpers from `eslint/config`.
- **Line 7-8 (Build Ignores)**:
  - **Basic Function**: Configures paths that the linter should bypass.
  - **Detailed Explanation**: Uses `globalIgnores(['dist'])` inside the configuration array to prevent checking production builds.
- **Lines 9-15 (Linter Target & Config Rules)**:
  - **Basic Function**: Specifies the files to lint and the configurations they inherit.
  - **Detailed Explanation**: Targets all `.js` and `.jsx` files and extends the rule bases from the recommended JS rules, the React Hooks flat configuration rules, and the Vite-specific React refresh configuration.
- **Lines 16-21 (Global Settings)**:
  - **Basic Function**: Sets global variables and syntax features.
  - **Detailed Explanation**: Configures `globals.browser` so variables like `window` or `document` are not flagged, and enables parsing of JSX syntax under `ecmaFeatures`.
