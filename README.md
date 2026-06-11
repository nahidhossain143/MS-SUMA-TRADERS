<div align="center">

<img src="https://img.shields.io/badge/MS%20SUMA%20TRADERS-%F0%9F%8C%BE%20Rice%20Wholesale%20%26%20Retail-16a34a?style=for-the-badge&labelColor=052e16" alt="MS SUMA TRADERS" />

<h1>🌾 MS SUMA TRADERS</h1>
<p><strong>Premium Rice Wholesale & Retail — Brahmanbaria, Bangladesh</strong></p>

<p>
  <img src="https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169e1?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-Auth-6c47ff?style=flat-square&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white" />
</p>

<p>
  <img src="https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Render-46e3b7?style=flat-square&logo=render&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-Neon%20PostgreSQL-00e5bf?style=flat-square&logo=neon&logoColor=white" />
</p>

</div>

---

## 📌 Overview

**MS SUMA TRADERS** হলো ব্রাহ্মণবাড়িয়া জেলার একটি premium rice wholesale ও retail e-commerce platform। এই application-এ customers সরাসরি catalog browse করে order দিতে পারেন, এবং admin panel থেকে পুরো business manage করা যায়।

> **চাল পাইকারি ও খুচরা** — সব ৯টি উপজেলায় ডেলিভারি সুবিধা সহ।

---

## ✨ Features

### 👤 Customer Side
- 🛍️ **Product Catalog** — সুন্দর product card, image carousel, stock status, price per kg
- 🔍 **Advanced Filters** — category, origin, availability, sort by price/stock
- 🛒 **Order Form** — quantity stepper, upazila selector, bKash/Nagad/Cash on delivery
- 📦 **Order History** — real-time status tracking (Pending → Processing → Delivered)
- 🔐 **Clerk Auth** — Google/email sign up, secure sessions

### 👑 Admin Panel (`/admin`)
- 📊 **Dashboard Stats** — total orders, revenue, inventory value, low stock alerts
- 📍 **Upazila Breakdown** — কোন এলাকা থেকে কত order এসেছে
- 🗂️ **Product Management** — create, edit, image upload, activate/deactivate
- 📋 **Order Management** — status pipeline, filter by status & upazila
- 🏷️ **Category Analytics** — category-wise product count ও stock

---

## 🖼️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Node.js, Express 4 |
| **Database** | PostgreSQL (Neon serverless) |
| **ORM** | Prisma 5 |
| **Auth** | Clerk (`@clerk/clerk-react`, `@clerk/express`) |
| **File Upload** | Multer (local storage) |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Notifications** | react-hot-toast |
| **Hosting** | Vercel (frontend) + Render (backend) |

---

## 🗂️ Project Structure

```
ms-suma-traders/
├── client/                    # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── OrderForm.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── OrderHistory.jsx
│   │   │   ├── SignInPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   └── lib/
│   │       ├── axios.js        # Central Axios instance
│   │       ├── constants.js
│   │       └── useConfig.js
│   └── vercel.json             # Vercel SPA routing config
│
├── server/                    # Node.js + Express Backend
│   ├── prisma/
│   │   ├── schema.prisma       # DB models (User, Product, Order)
│   │   ├── migrations/
│   │   └── seed.js             # Sample product data
│   └── src/
│       ├── routes/
│       │   ├── products.js     # Public product catalog API
│       │   ├── orders.js       # Authenticated order API
│       │   ├── admin.js        # Admin-only API
│       │   └── webhooks.js     # Clerk webhook handler
│       ├── middleware/
│       │   ├── auth.js         # Clerk auth + admin check
│       │   └── upload.js       # Multer file upload
│       └── index.js            # Express app entry
│
├── render.yaml                 # Render.com deployment config
└── .gitignore
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | Public | Active product list (filterable) |
| `GET` | `/api/products/:id` | Public | Single product |
| `GET` | `/api/config` | Public | Business info (phone, payment numbers) |
| `GET` | `/api/health` | Public | Server health check |
| `POST` | `/api/orders` | 🔐 User | Place new order |
| `GET` | `/api/orders/my` | 🔐 User | User's order history |
| `GET` | `/api/admin/products` | 👑 Admin | All products (incl. inactive) |
| `POST` | `/api/admin/products` | 👑 Admin | Create product |
| `PUT` | `/api/admin/products/:id` | 👑 Admin | Update product |
| `DELETE` | `/api/admin/products/:id` | 👑 Admin | Archive product |
| `GET` | `/api/admin/orders` | 👑 Admin | All orders (paginated, filterable) |
| `PUT` | `/api/admin/orders/:id/status` | 👑 Admin | Update order status |
| `GET` | `/api/admin/stats` | 👑 Admin | Dashboard statistics |
| `POST` | `/api/upload` | 👑 Admin | Upload product images |
| `POST` | `/api/webhooks/clerk` | Webhook | Clerk user sync |

---

## ⚡ Local Development

### Prerequisites
- Node.js 18+
- Git

### 1. Clone করুন
```bash
git clone https://github.com/nahidhossain143/MS-SUMA-TRADERS.git
cd MS-SUMA-TRADERS
```

### 2. Server Setup
```bash
cd server
npm install

# .env তৈরি করুন
cp .env.example .env
# .env ফাইলটি edit করে আপনার credentials দিন
```

### 3. Client Setup
```bash
cd ../client
npm install

# .env তৈরি করুন
cp .env.example .env
# VITE_CLERK_PUBLISHABLE_KEY দিন
```

### 4. Database Setup
```bash
cd server
npx prisma generate
npx prisma migrate dev
npm run db:seed    # Sample 6টি product add করবে
```

### 5. Run করুন (দুইটি terminal)
```bash
# Terminal 1 — Backend
cd server && npm run dev
# → http://localhost:5000

# Terminal 2 — Frontend
cd client && npm run dev
# → http://localhost:5173
```

---

## 🌐 Deployment

### Backend → Render.com
```yaml
Root Directory:  server
Build Command:   npm install && npx prisma generate
Start Command:   node src/index.js
```

**Environment Variables:**
```env
NODE_ENV=production
DATABASE_URL=your_neon_postgresql_url
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLIENT_URL=https://your-vercel-app.vercel.app
ADMIN_USER_IDS=your_clerk_user_id
BKASH_NUMBER=01XXXXXXXXX
NAGAD_NUMBER=01XXXXXXXXX
BUSINESS_PHONE=01XXXXXXXXX
BUSINESS_WHATSAPP=01XXXXXXXXX
```

### Frontend → Vercel
```
Root Directory:  client
Build Command:   npm run build
Output Dir:      dist
```

**Environment Variables:**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://your-render-app.onrender.com
```

---

## 🔐 Admin Access Setup

1. App-এ sign up করুন
2. [Clerk Dashboard](https://dashboard.clerk.com) → Users → আপনার User ID copy করুন
3. Render/server `.env`-এ set করুন:
   ```env
   ADMIN_USER_IDS=user_your_clerk_user_id
   ```
4. Server restart করুন
5. `/admin` route-এ যান — full admin access পাবেন

---

## 📦 Database Schema

```prisma
model User {
  id          String   @id
  clerkUserId String   @unique
  email       String   @unique
  name        String?
  phone       String?
  address     String?
  upazila     String?
  isAdmin     Boolean  @default(false)
  orders      Order[]
}

model Product {
  id           String   @id
  name         String          # English name
  nameBn       String          # বাংলা নাম
  description  String
  imageUrl     String
  imageUrls    String[]        # Multiple images
  pricePerBag  Decimal
  bagWeightKg  Int      @default(25)
  stock        Int      @default(0)
  isActive     Boolean  @default(true)
  category     String
  origin       String
  orders       Order[]
}

model Order {
  id            String        @id
  orderNumber   String        @unique
  customerName  String
  phone         String
  upazila       String
  address       String
  quantity      Int
  totalPrice    Decimal
  status        OrderStatus   @default(PENDING)
  paymentMethod PaymentMethod @default(CASH_ON_DELIVERY)
  notes         String?
}
```

---

## 🌾 Rice Categories

| Category | বাংলা |
|----------|-------|
| Fine Rice | সূক্ষ্ম চাল (মিনিকেট, নাজিরশাইল) |
| Aromatic Rice | সুগন্ধি চাল (চিনিগুঁড়া, বাসমতি) |
| Common Rice | সাধারণ চাল (BR-28, BRRI) |
| Parboiled Rice | সিদ্ধ চাল |
| Health Rice | স্বাস্থ্য চাল (লাল চাল, ব্রাউন রাইস) |

---

## 🤝 Payment Methods

| Method | বাংলা |
|--------|-------|
| 💳 bKash | বিকাশ |
| 📱 Nagad | নগদ |
| 💵 Cash on Delivery | ডেলিভারির সময় নগদ |

---

<div align="center">

**Delivery Coverage** — ব্রাহ্মণবাড়িয়া জেলার সকল ৯টি উপজেলা

`ব্রাহ্মণবাড়িয়া সদর` • `আশুগঞ্জ` • `সরাইল` • `বাঞ্ছারামপুর` • `কসবা` • `নবীনগর` • `নাসিরনগর` • `বিজয়নগর` • `আখাউড়া`

---

*© 2024 MS SUMA TRADERS — All rights reserved*

*Made with ❤️ for Brahmanbaria*

</div>
