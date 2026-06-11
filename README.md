# MS SUMA TRADERS 🌾
### Premium Rice Wholesale & Retail Web Application

> Built with PostgreSQL · Express · React · Node.js (PERN Stack)
> Authentication: Clerk | ORM: Prisma | UI: Tailwind CSS

---

## 📁 Project Structure

```
ms-suma-traders/
├── client/          # React + Vite + Tailwind Frontend
└── server/          # Node.js + Express + Prisma Backend
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally
- A [Clerk](https://clerk.com) account (free)

---

### 1. Clone & Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

---

### 2. Configure Environment Variables

#### Server (`server/.env`):
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ms_suma_traders?schema=public"
CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
PORT=5000
CLIENT_URL="http://localhost:5173"
ADMIN_USER_IDS="user_your_clerk_user_id"
```

#### Client (`client/.env`):
```env
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

> **Get your Clerk keys:** Go to https://dashboard.clerk.com → Create application → API Keys

---

### 3. Set Up the Database

```bash
cd server

# Generate Prisma client
npm run db:generate

# Run migrations (creates tables)
npm run db:migrate

# Optional: initialize without hardcoded products
npm run db:seed
```

---

### 4. Run the Application

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev
# → Server running at http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev
# → App running at http://localhost:5173
```

---

## 🔐 Admin Setup

1. Sign up on the app using Clerk
2. Copy your Clerk User ID from the Clerk Dashboard → Users
3. Add it to `server/.env` as `ADMIN_USER_IDS="user_xxxxx"`
4. Restart the server
5. Navigate to `/admin` — you now have full admin access

---

## 📡 API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | Public | List all active products |
| GET | `/api/products/:id` | Public | Single product |
| POST | `/api/orders` | 🔐 User | Place new order |
| GET | `/api/orders/my` | 🔐 User | User's order history |
| GET | `/api/admin/products` | 👑 Admin | All products (incl. inactive) |
| POST | `/api/admin/products` | 👑 Admin | Create product |
| PUT | `/api/admin/products/:id` | 👑 Admin | Update product |
| DELETE | `/api/admin/products/:id` | 👑 Admin | Deactivate product |
| GET | `/api/admin/orders` | 👑 Admin | All orders (filterable) |
| PUT | `/api/admin/orders/:id/status` | 👑 Admin | Update order status |
| GET | `/api/admin/stats` | 👑 Admin | Dashboard statistics |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Auth | Clerk (`@clerk/clerk-react`, `@clerk/express`) |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| HTTP Client | Axios |
| UI Icons | Lucide React |
| Toast Notifications | react-hot-toast |

---

## 🌾 Features

**Customer Side:**
- Beautiful homepage with hero, product grid, features, stats
- Rice product cards with images, prices, stock levels
- One-click "Buy Now" modal with quantity stepper
- Order history with real-time status tracking

**Admin Panel (`/admin`):**
- Dashboard with key business metrics
- Product management (create, edit, deactivate)
- Order management with status pipeline (Pending → Processing → Delivered)
- Status filter and real-time refresh

---

*© 2024 MS Suma Traders. All rights reserved.*
