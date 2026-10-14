# ShopKart Frontend (Vite + React 19 + Tailwind CSS v4)

This folder contains the client-side single-page application for **ShopKart**.

For complete end-to-end setup instructions (including backend and database), refer to the root [README.md](../../README.md).

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The app will run at `http://localhost:5173`. Make sure the backend server is running on `http://localhost:8008`.

### 3. Build for Production
```bash
npm run build
```

### 4. Preview the Production Build
```bash
npm run preview
```

### 5. Lint Code
```bash
npm run lint
```

---

## Tech Stack & Architecture

- **React 19**: Modern component architecture with React hooks.
- **Vite 8**: Ultra-fast build tool and dev server.
- **Tailwind CSS v4**: Utility-first CSS styling using `@tailwindcss/vite` and `@source` directives.
- **React Router DOM v7**: Client-side routing with public and protected route guards.
- **Axios**: HTTP requests with automatic cookie credentials (`baseURL: http://localhost:8008`).
- **Context API**: Global state management for authentication (`AuthContext`) and shopping cart (`CartContext`).
