# frontend/index.html

## 1. Overview
`frontend/index.html` is the primary HTML entry page for the single-page application (SPA).

## 2. Key Responsibilities & Flow
- Declares the fundamental DOM root element: `<div id="root"></div>`.
- Mounts the client application by including the core React entry script via `<script type="module" src="/src/main.jsx"></script>`.
- Embeds favicon details (`/favicon.svg`), charset rules, and viewport scaling bounds.

## 3. Code Patterns & Best Practices
- **SPA Entry Mounting**: Uses Vite's native ES module bundling loader (`type="module"`) to fetch the `/src/main.jsx` entrypoint directly in development, letting Vite compile files on-the-fly.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- Renders the web shell that dynamically displays views and handles all AJAX/Fetch interactions communicating with backend Express API routing.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Document Declaration & Head Configuration**: Sets metadata, charset, scaling viewports, favicon link, and title.
2. **Body Elements & App Mounting**: Declares the mounting node for React (`<div id="root">`) and includes the entrypoint module script `/src/main.jsx`.

- **Lines 1-8 (Document Declaration & Head Configuration)**:
  - **Basic Function**: Configures the document metadata.
  - **Detailed Explanation**: Defines HTML5 doctype and opens the document structure with English language settings. The head configures UTF-8 encoding, a responsive viewport, a favicon SVG import from `/favicon.svg`, and the page title.
- **Lines 9-13 (Body Elements & App Mounting)**:
  - **Basic Function**: Creates the target DOM mount point and executes the script.
  - **Detailed Explanation**: Provides the `<div id="root">` element, which is targeted by React DOM in `src/main.jsx`. Loads the app's React entry script `/src/main.jsx` as an ES module via `<script type="module">`.
