# ShopKart — Full-Stack MERN E-Commerce Platform

ShopKart is a modern full-stack e-commerce web application built using the **MERN** stack (**M**ongoDB, **E**xpress, **R**eact, **N**ode.js). It provides a responsive shopping experience featuring user authentication, product search and categorization, wishlist management, a live shopping cart, Razorpay payment gateway integration, and order tracking.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started / Setup Instructions](#getting-started--setup-instructions)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Environment Variables](#environment-variables)
- [API Endpoints Reference](#api-endpoints-reference)
- [User Journey / Testing the App](#user-journey--testing-the-app)
- [Troubleshooting & Common Issues](#troubleshooting--common-issues)
- [License](#license)

---

## Features

- **Authentication & Security**:
  - Customer signup, login, and secure logout.
  - JWT authentication stored in HTTP-only cookies (`withCredentials`).
  - Password hashing with Bcrypt.
  - Protected and public route guards.

- **Product Discovery**:
  - Filter products by category (Electronics, Fashion, Books, Home).
  - Real-time search query support.
  - Detailed product view with stock status and instant add-to-cart/wishlist.

- **Shopping Cart & Wishlist**:
  - Persistent server-synced cart and wishlist.
  - Dynamic item quantity increment/decrement and item removal.
  - Real-time cart total computation and item counter badge on the navbar.

- **Checkout & Payments**:
  - Multi-field shipping address form with validation.
  - Seamless Razorpay payment gateway integration with built-in development fallback simulation.
  - Automated order creation and payment verification.

- **Order Tracking**:
  - View user order history and detailed order confirmation receipts.
  - Order delivery status tracking (`Pending`, `Processing`, `Shipped`, `Delivered`).

- **Responsive Modern UI**:
  - Clean UI built with Tailwind CSS v4.
  - Active state navigation links, badges, and responsive layout for mobile and desktop.

---

## Tech Stack

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with credentials / cookies
- **State Management**: React Context API (`AuthContext`, `CartContext`)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Token (`jsonwebtoken`), `cookie-parser`, `bcrypt`
- **Payment Gateway**: Razorpay REST API & HMAC-SHA256 signature verification
- **CORS**: Configured for `http://localhost:5173` with cookie credentials

---

## Project Architecture

```text
ShopKart_mern/
├── Backend/
│   ├── controllers/         # Request handlers (auth, cart, orders, products, wishlist)
│   ├── middlewares/         # JWT auth middleware (isAuthenticated)
│   ├── models/              # Mongoose schemas (Customer, Product, Order)
│   ├── routes/              # Express API route declarations
│   ├── utils/               # Razorpay order creation & signature verification, token helpers
│   ├── .env.example         # Template for backend environment variables
│   ├── index.js             # Express application entry point (Port 8008)
│   └── package.json         # Backend scripts and dependencies
│
├── Frontend/
│   ├── axios/               # Axios instance with baseURL & withCredentials
│   ├── components/          # Shared components (Navbar, ProductCard, ProtectedRoute, etc.)
│   ├── context/             # AuthContext, CartContext, useAuth, useCart hooks
│   └── vite-project/        # Main Vite application
│       ├── pages/           # Application views (Home, Products, Cart, Checkout, etc.)
│       ├── servies/         # Frontend API service functions (api.js)
│       ├── src/
│       │   ├── App.jsx      # Routes definition
│       │   ├── index.css    # Tailwind CSS v4 entry point with @source directives
│       │   └── main.jsx     # React root entry
│       ├── index.html       # HTML entry template
│       ├── package.json     # Frontend scripts and dependencies
│       └── vite.config.js   # Vite + Tailwind plugins configuration
│
├── .gitignore               # Root gitignore
└── README.md                # Project documentation
```

---

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher (Node `v20+` recommended)
- **npm**: `v9.0.0` or higher
- **MongoDB**: A running local MongoDB server (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster.
- **Git** (optional, for cloning)

---

## Getting Started / Setup Instructions

### 1. Backend Setup

1. **Navigate to the `Backend` directory**:
   ```bash
   cd Backend
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example `.env.example` file to create your own `.env` file:
   ```bash
   cp .env.example .env
   ```

   Open `.env` and fill in your values:
   ```env
   PORT=8008
   dbURL=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/shopkart?retryWrites=true&w=majority
   JWT_secret=your_super_secret_jwt_key_here
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
   > **Note on MongoDB**: You can use a local connection string such as `mongodb://127.0.0.1:27017/shopkart` if running MongoDB locally.
   >
   > **Note on Razorpay**: If Razorpay keys are omitted or invalid during local testing, the application includes a fallback simulation mode so order placement still works smoothly without breaking.

4. **Start the Backend Server**:
   - **Development mode (auto-reload)**:
     ```bash
     npm run dev
     ```
   - **Production mode**:
     ```bash
     npm start
     ```
   The backend will start at:
   ```
   Server Has Started at port 8008
   DB Connected Successfully
   ```

---

### 2. Frontend Setup

1. **Open a new terminal and navigate to the frontend app**:
   ```bash
   cd Frontend/vite-project
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start the Vite development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## Environment Variables

| Variable | Required | Default / Description |
|---|---|---|
| `dbURL` / `dburl` | **Yes** | MongoDB connection string (Atlas URI or local `mongodb://localhost:27017/shopkart`). |
| `JWT_secret` | **Yes** | Secret string used to sign and verify JSON Web Tokens for user authentication. |
| `RAZORPAY_KEY_ID` | Optional | Razorpay Key ID obtained from your [Razorpay Dashboard](https://dashboard.razorpay.com). |
| `RAZORPAY_KEY_SECRET` | Optional | Razorpay Key Secret. Used to verify order payment signatures. |
| `PORT` | Optional | Port for Express server (defaults to `8008`). |

---

## API Endpoints Reference

The backend runs on `http://localhost:8008`. All requests with cookies pass credentials via `withCredentials: true`.

### Authentication (`/customers`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/customers/register` | Register a new customer (`fullName`, `email`, `phone`, `password`) | No |
| `POST` | `/customers/login` | Login and receive HTTP-only JWT cookie | No |
| `POST` | `/customers/logout` | Clear auth cookie | No |
| `GET` | `/customers/me` | Fetch authenticated profile details | **Yes** |
| `PATCH` | `/customers/change-password` | Update current password | **Yes** |

### Products (`/products`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/products` | List all products (supports `?search=` and `?category=`) | No |
| `GET` | `/products/:id` | Get single product by ID | No |
| `POST` | `/products` | Create a new product | No |

### Shopping Cart (`/cart`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/cart` | Fetch user's active shopping cart | **Yes** |
| `POST` | `/cart/:productId` | Add item to cart | **Yes** |
| `PATCH` | `/cart/:productId` | Update item quantity (`quantity`, `action: 'increment'/'decrement'`) | **Yes** |
| `DELETE` | `/cart/:productId` | Remove item from cart | **Yes** |

### Wishlist (`/wishlist`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/wishlist` | Fetch customer wishlist | **Yes** |
| `POST` | `/wishlist/:productId` | Add product to wishlist | **Yes** |
| `DELETE` | `/wishlist/:productId` | Remove product from wishlist | **Yes** |

### Orders & Checkout (`/orders`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/orders/create-payment-order`| Create Razorpay order and reserve order details | **Yes** |
| `POST` | `/orders/verify-payment` | Verify Razorpay HMAC signature & confirm order | **Yes** |
| `GET` | `/orders` | List logged-in user's past orders | **Yes** |
| `GET` | `/orders/:id` | Get specific order confirmation by ID | **Yes** |
| `PATCH` | `/orders/:id/status` | Update delivery/payment status | No |

---

## User Journey / Testing the App

1. **Register an Account**:
   - Head to `http://localhost:5173/register` and enter your name, email, phone number, and password.
2. **Browse Products**:
   - Navigate to `/products` to browse items by category (Electronics, Fashion, Books, Home) or search by keyword.
3. **Add to Cart & Wishlist**:
   - Click the heart icon to save products to your Wishlist (`/wishlist`).
   - Click **Add to Cart** to update the cart counter on the navbar.
4. **Checkout**:
   - Go to `/cart`, adjust item quantities, and proceed to `/checkout`.
   - Fill in your shipping address and complete the checkout via Razorpay (or test mode).
5. **View Orders**:
   - Receive your order confirmation and view past orders at `/orders`.

---

## Troubleshooting & Common Issues

### 1. `Missing MongoDB connection URL in environment variables`
- Make sure you copied `.env.example` to `Backend/.env` and supplied a valid `dbURL` string.
- If using MongoDB Atlas, verify that your IP address is whitelisted under **Network Access** in the Atlas dashboard.

### 2. CORS Issues / Cookies not being set
- The backend is configured to accept CORS from `http://localhost:5173` with `credentials: true`.
- Ensure the frontend is running on port `5173`. If Vite picks another port (e.g. `5174`), update the `origin` in `Backend/index.js`.

### 3. Tailwind CSS classes not showing up
- Tailwind CSS v4 scans files configured in `Frontend/vite-project/src/index.css`.
- Notice the `@source` directives in `index.css`:
  ```css
  @import "tailwindcss";
  @source "../../components";
  @source "../pages";
  ```
  This ensures files outside `vite-project/src/` (such as `Frontend/components/Navbar.jsx`) are compiled.

### 4. Port Conflicts
- If port `8008` is already in use:
  - Check running processes: `lsof -i :8008`
  - Terminate the conflicting process: `kill -9 <PID>`

---

## License

This project is licensed under the ISC License. Feel free to use and customize it for learning and production applications.
