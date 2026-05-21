# backend/README.md

## 1. Overview
The `backend/README.md` provides documentation on the environment configuration required to set up and run the Node.js backend. It focuses on the variables needed inside `.env`.

## 2. Key Responsibilities & Flow
- Tabulates all configuration keys (`MONGODB_URI`, `FRONTEND_URL`, `PORT`, `JWT_TOKEN`, `JWT_REFRESH_TOKEN`, `EMAIL`, `PASSWORD`, `NODE_ENV`).
- Explains what each parameter represents.
- Provides a clean `.env.example` copy-paste template.
- Warns users about keeping `.env` excluded from version control systems (Git) using `.gitignore`.

## 3. Code Patterns & Best Practices
- Structured as standard GitHub Flavored Markdown (GFM).
- Uses code-block syntax (`env`) for template config variables.

## 4. Frontend-to-Backend / Backend-to-Frontend Mapping
- References the frontend location (`http://localhost:5173`) as the default for `FRONTEND_URL`.
- Provides connection instructions that align with how `frontend/src/app/axiosInterceptors.js` and `frontend/.env` configure API access.

## 5. Line-by-Line Code Explanation

### Basic Function of Key Logical Parts
1. **Title & Introduction**: Introduces the purpose of the backend environment documentation.
2. **Environment Variables Table**: Provides descriptions and example values for each environment variable.
3. **Example Code Block**: Shows a sample configuration template for a `.env` file.
4. **Security Notice**: Warns developer about keeping credentials private.

- **Lines 1-6 (Title & Introduction)**:
  - **Basic Function**: Introduce the backend environment setup instructions.
  - **Detailed Explanation**: Lines 1-3 declare the header and the introductory description of the file. Lines 5-6 instruct developers on creating a `.env` file within the `backend` directory root.
  - **Key Function Calls**: None
- **Lines 7-19 (Environment Variables Table)**:
  - **Basic Function**: Define all expected config variables, their descriptions, and defaults.
  - **Detailed Explanation**: Tabulates variables including MONGODB_URI (Line 11), FRONTEND_URL (Line 12), PORT (Line 13), JWT_TOKEN (Line 14), JWT_REFRESH_TOKEN (Line 15), EMAIL (Line 16), PASSWORD (Line 17), and NODE_ENV (Line 18).
  - **Key Function Calls**: None
- **Lines 20-33 (Example Code Block)**:
  - **Basic Function**: Display a boilerplate configuration block.
  - **Detailed Explanation**: Contains a code-block syntax showcasing how key-value pairs should be declared and structured inside the `.env` file.
  - **Key Function Calls**: None
- **Lines 34-36 (Security Notice)**:
  - **Basic Function**: Remind developers to not commit production credentials to Git.
  - **Detailed Explanation**: An advisory callout (Line 35) highlighting that `.env` contains credentials and must be excluded from Git using `.gitignore`.
  - **Key Function Calls**: None
