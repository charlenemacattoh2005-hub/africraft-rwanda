# AfriCraft Rwanda — E-Commerce Web Application

**Course:** EWA408510 – E-Commerce and Web Application
**Instructor:** Eric Maniraguha
**Academic Year:** 2025–2026
**Assessment:** Individual Project (40 Marks + 5 Bonus)
**Submission Period:** 21 June – 3 July 2026

---

## Live Links

| Item | URL |
|------|-----|
| GitHub Repository | https://github.com/charlenemacattoh2005-hub/africraft-rwanda |
| Live Application (Vercel) | https://africraft-rwanda-sable.vercel.app |
| Backend API (Render) | https://dellcraft-api.onrender.com |
| API Health Check | https://dellcraft-api.onrender.com/health |

---

## Project Report

### 1. Introduction

AfriCraft Rwanda is a full-stack, multi-vendor e-commerce web application designed to connect Rwandan artisans with customers locally and globally. The platform enables artisans to list and manage handcrafted products while customers can browse, search, add items to a cart, and place orders seamlessly.

The application was built as the final project for EWA408510 – E-Commerce and Web Application at Rwanda Coding Academy. It demonstrates practical application of modern web development, DevOps practices, database design, and cloud deployment.

The business domain chosen is a **Handicraft Marketplace** — a platform where vendors sell authentic Rwandan crafts including baskets, pottery, jewelry, wood carvings, paintings, and more.

---

### 2. Problem Statement

Rwanda has a rich tradition of handcrafted goods, yet most artisans lack access to digital platforms to reach a wider market. Existing solutions are either too generic, too expensive, or not designed for the local context. Customers interested in authentic Rwandan crafts have no single trusted online destination to discover, compare, and purchase these products.

There is a clear need for a dedicated, professional e-commerce platform that:
- Allows multiple vendors to list and manage their products
- Gives customers a seamless browsing and purchasing experience
- Provides administrators full control over the platform
- Handles orders, payments, and delivery tracking digitally
- Is accessible on any device, anywhere in Rwanda and beyond

---

### 3. Project Objectives

1. Build a responsive, mobile-first e-commerce web application using the MERN stack
2. Implement user authentication with role-based access control (Admin, Vendor, Rider, Customer)
3. Develop a complete product management system with categories, search, and filtering
4. Implement a fully functional shopping cart and checkout process with validation
5. Integrate a MongoDB database to persist products, orders, users, and reviews
6. Deploy the frontend on Vercel and the backend API on Render
7. Containerize the application using Docker and docker-compose
8. Implement a CI/CD pipeline using GitHub Actions
9. Build a professional admin dashboard for platform management
10. Add vendor and rider dashboards for role-specific workflows

---

### 4. System Features

#### Customer Features
- Browse products by category, search by keyword, filter by price and sort
- View detailed product pages with images, descriptions, ratings, and reviews
- Add, remove, and update quantities in the shopping cart
- Checkout with customer information, delivery address, and payment method
- Order confirmation page and order history
- Wishlist management
- Submit and view product reviews
- User profile management

#### Vendor Features
- Vendor dashboard with KPIs: revenue, orders, products, earnings
- Add, edit, and delete products with Cloudinary image upload
- View and track orders for their products
- Real-time payout calculation with configurable platform fee
- Store profile management

#### Admin Features
- Full admin dashboard with analytics, revenue charts, activity feed
- Product management: create, edit, delete, bulk actions, assign to vendors
- Order management: status pipeline (12 statuses), timeline, notes, rider assignment
- User management: create, suspend, activate, assign roles
- Category management with image upload
- Inventory management with stock alerts
- Coupon and discount management (MongoDB-backed)
- Notification system with real-time alerts
- Analytics page with revenue charts and category performance
- Site content CMS: announcement bar, hero text, platform settings

#### Rider Features
- Rider dashboard with assigned deliveries
- Accept and advance delivery status (shipped → out for delivery → delivered)
- Earnings summary based on configurable per-delivery rate
- Delivery history

#### Platform Features
- Role-based access control: Admin, Vendor, Rider, Customer
- JWT authentication with bcrypt password hashing
- Cloudinary image upload (no URL text boxes — file upload only)
- CORS configured for Vercel + localhost origins
- Input validation on all forms (client and server)
- Professional error handling with user-friendly messages
- Retry logic on API calls (5 attempts with exponential backoff)
- Server warm-up detection for Render free-tier cold starts

---

### 5. Technologies Used

#### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework and type safety |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| CSS Modules (custom) | Styling with design tokens |

#### Backend
| Technology | Purpose |
|---|---|
| Node.js 20 + Express | REST API server |
| Mongoose | MongoDB ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcrypt | Password hashing |
| cors | Cross-origin resource sharing |
| dotenv | Environment variable management |
| Cloudinary + Multer | Image upload and storage |
| express-validator | Server-side input validation |

#### Database
| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted NoSQL database |
| Mongoose Schemas | Data modeling and validation |

#### DevOps & Deployment
| Technology | Purpose |
|---|---|
| GitHub | Version control and collaboration |
| GitHub Actions | CI/CD pipeline automation |
| Vercel | Frontend static site deployment |
| Render | Backend Node.js API hosting |
| Docker + docker-compose | Containerization |
| Nginx | Frontend production server (Docker) |

#### Security
| Feature | Implementation |
|---|---|
| Password hashing | bcrypt (10 rounds) |
| Authentication | JWT Bearer tokens |
| Authorization | Role-based middleware |
| Input validation | express-validator + client forms |
| CORS | Explicit origin allowlist |
| Error handling | Centralized errorHandler middleware |

---

### 6. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│         React SPA (Vite) — Vercel CDN                       │
│  ┌──────────────┐  ┌───────────┐  ┌────────────────────┐   │
│  │  Public Pages│  │  Customer │  │  Admin/Vendor/Rider │   │
│  │  Home, Shop  │  │  Account  │  │  Dashboards         │   │
│  └──────┬───────┘  └─────┬─────┘  └────────┬───────────┘   │
└─────────┼────────────────┼─────────────────┼───────────────┘
          │   HTTPS / REST API  (VITE_API_URL)│
          ▼                                   ▼
┌─────────────────────────────────────────────────────────────┐
│              Express REST API — Render                       │
│                                                             │
│  CORS → auth middleware → routes → controllers → models     │
│                                                             │
│  /api/auth      /api/products   /api/categories             │
│  /api/orders    /api/users      /api/reviews                │
│  /api/admin/*   /api/upload     /api/wishlist               │
└──────────────────────────┬──────────────────────────────────┘
                           │
          ┌────────────────┴──────────────────┐
          ▼                                   ▼
┌─────────────────┐                 ┌──────────────────┐
│  MongoDB Atlas  │                 │  Cloudinary CDN  │
│  (Cloud DB)     │                 │  (Image Storage) │
└─────────────────┘                 └──────────────────┘
```

**Key architectural decisions:**
- Frontend and backend are fully decoupled (separate repos/deploys)
- All admin/vendor/rider routes render outside the public Layout component to prevent duplicate sidebar rendering
- API client (`api.ts`) is centralised — all 60+ service functions use one retry/timeout/error handler
- Server starts and binds port BEFORE connecting to MongoDB so Render health checks pass

---

### 7. Database Design

The MongoDB database (`dellcraft`) contains the following collections:

#### Users
```
_id, fullName, email, passwordHash, role (customer|vendor|admin|rider),
phone, address, profilePhoto, bio, isActive, timestamps
```

#### Products
```
_id, name, description, price, discountPrice, imageUrl, images[],
category, stock, stockTracking, sku, barcode, status, isActive,
badge, featured, variants[], vendor (ref: User), timestamps
```

#### Orders
```
_id, userId (ref: User), customer{fullName,phone,email,address,paymentMethod},
status (12-state enum), items[{productId,name,qty,price,lineTotal}],
subtotal, deliveryFee, total, riderId (ref: User),
timeline[{status,note,by,at}], adminNote, trackingNumber, timestamps
```

#### Categories
```
_id, name, description, imageUrl, isActive, timestamps
```

#### Reviews
```
_id, productId (ref: Product), userId (ref: User),
rating, comment, timestamps
```

#### Cart
```
_id, userId (ref: User), items[{productId,quantity}], timestamps
```

#### Wishlist
```
_id, userId (ref: User), products[] (ref: Product), timestamps
```

#### Discounts
```
_id, code (unique), type (percentage|fixed), value, minOrder,
maxUses, uses, startDate, endDate, isActive, description, timestamps
```

#### SiteContent (Singleton CMS)
```
_id, key="main", heroTitle, heroSubtitle, heroImageUrl, heroBanners[],
platformFeePercent, riderEarningsPerDelivery, announcementBar,
contactEmail, contactPhone, timestamps
```

**Entity Relationships:**
- User (1) → Orders (many)
- User (Vendor) → Products (many)
- Order (1) → OrderItems (many)
- Product → Category (many-to-one)
- Product → Reviews (many)
- User → Cart (one-to-one)
- User → Wishlist (one-to-one)

---

### 8. Screenshots of the Application

Screenshots are located in the `docs/screenshots/` directory and include:

| Screen | Description |
|---|---|
| Homepage | Hero section, categories, featured products |
| Products Page | Grid layout, filters, search |
| Product Detail | Images, description, add to cart, reviews |
| Shopping Cart | Items, quantities, totals |
| Checkout | Customer form, order summary, validation |
| Order Confirmation | Success state, order ID |
| Login / Register | Auth forms with demo credentials |
| Admin Dashboard | KPI cards, revenue chart, activity feed |
| Admin Products | Table with bulk actions, Cloudinary upload |
| Admin Orders | Status pipeline, timeline, notes |
| Admin Users | Role management, suspend/activate |
| Vendor Dashboard | KPIs, products, orders, analytics |
| Rider Dashboard | Delivery cards, advance status, earnings |

> To generate screenshots: run the app locally (`npm run dev`) and capture each screen.

---

### 9. GitHub Repository Link

**Repository:** https://github.com/charlenemacattoh2005-hub/africraft-rwanda

The repository includes:
- Meaningful commit history (80+ commits) documenting every major feature
- Proper project structure with `client/`, `server/`, `.github/`, `docs/`
- Complete `README.md` (this file)
- `.github/workflows/ci-cd.yml` for automated CI/CD
- `docker-compose.yml` and `Dockerfile` for both services
- `server/.env.example` and `client/.env.example` for environment setup

---

### 10. Deployment Link

| Service | URL | Platform |
|---|---|---|
| Frontend | https://africraft-rwanda-sable.vercel.app | Vercel |
| Backend API | https://dellcraft-api.onrender.com | Render |
| Health Check | https://dellcraft-api.onrender.com/health | Render |

**Demo Credentials:**

| Role | Email | Password |
|---|---|---|
| Admin | admin@dellcraft.rw | Admin@2026! |
| Vendor | vendor@dellcraft.rw | Admin@2026! |
| Rider | rider@dellcraft.rw | Admin@2026! |
| Customer | customer@dellcraft.rw | Admin@2026! |

> Note: The backend is hosted on Render's free tier. The first request after inactivity may take 20–60 seconds to respond (cold start). The login page shows a server status indicator while the backend wakes up.

---

### 11. CI/CD Implementation

**File:** `.github/workflows/ci-cd.yml`

The GitHub Actions pipeline runs automatically on every push and pull request to `main`.

#### Pipeline Steps

```yaml
name: CI/CD Pipeline
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install root dependencies
      - Install server dependencies
      - Install client dependencies
      - Build frontend (Vite)
      - Run backend tests
      - Build Docker images (docker-compose build)
```

#### Pipeline Results

Every successful push to `main` triggers:
1. ✅ Code checkout
2. ✅ Node.js 20 environment setup
3. ✅ Dependency installation (root + client + server)
4. ✅ Frontend build (`vite build` — 95 modules)
5. ✅ Backend tests
6. ✅ Docker build verification

Vercel and Render auto-deploy on push to `main` via GitHub integration, providing continuous deployment without manual intervention.

---

### 12. Docker Implementation

The application is fully containerised using Docker and orchestrated with docker-compose.

#### Files
- `client/Dockerfile` — Multi-stage build: Node 20 (build) → Nginx (serve)
- `server/Dockerfile` — Node 20 Alpine image
- `docker-compose.yml` — Orchestrates: web (Nginx), api (Express), mongo (MongoDB)

#### docker-compose.yml Summary

```yaml
services:
  web:           # React frontend served by Nginx on port 8080
  api:           # Express backend on port 5000
  mongo:         # MongoDB on port 27017

networks:
  app-network:   # Internal bridge network

volumes:
  mongo-data:    # Persistent MongoDB data
```

#### Running with Docker

```bash
# Build and start all services
npm run docker:up
# or
docker-compose up --build -d

# Services available:
# Web app:   http://localhost:8080
# API:       http://localhost:5000/health
# MongoDB:   localhost:27017

# Stop all services
npm run docker:down
```

#### client/Dockerfile (Multi-stage)

```dockerfile
# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### server/Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "src/index.js"]
```

---

### 13. Challenges Encountered

| Challenge | Solution Applied |
|---|---|
| **Render free-tier cold starts** causing "Failed to fetch" on first load | Added server warm-up service (`warmup.ts`) that pings `/health` on startup with exponential backoff. Login page shows server status indicator. |
| **CORS errors** from Vercel to Render | Replaced `origin: true` with an explicit allowlist. Changed origin callback from `callback(new Error())` to `callback(null, false)` to prevent CORS headers being stripped from error responses. |
| **Duplicate admin layout** — public nav appearing over admin sidebar | Restructured `App.tsx` so all admin/vendor/rider routes render outside the public `<Layout>` wrapper. |
| **Render deployment** root directory mismatch (`backend` vs `server`) | Added `render.yaml` with explicit `rootDir: server`, `buildCommand`, `startCommand`, and `healthCheckPath`. Added `postinstall` to root `package.json`. |
| **Cloudinary upload** — `multer-storage-cloudinary` SSL error on Windows | Replaced with `multer.memoryStorage()` + `cloudinary.uploader.upload_stream()` — no extra package needed. |
| **Vendor dashboard payout** using hardcoded 85% | Wired `fetchVendorPayout()` to the `SiteContent` model which stores the configurable `platformFeePercent`. |
| **MongoDB Atlas IP whitelist** blocking Render | Set Atlas network access to `0.0.0.0/0` to allow Render's dynamic IPs. |
| **TypeScript errors** in production build | Fixed all type errors: removed duplicate `safeId` function, typed nav items with `badge?` optional, removed unused imports. |

---

### 14. Future Enhancements

1. **Mobile Money Integration** — Integrate MTN Mobile Money and Airtel Money payment gateways for seamless RWF payments
2. **Real-Time Notifications** — WebSocket (Socket.io) for instant order status updates to customers and vendors
3. **AI Product Recommendations** — Recommend products based on browsing history and purchase patterns
4. **Progressive Web App (PWA)** — Add service worker and manifest for offline browsing and app installation
5. **Advanced Analytics** — Extend the analytics dashboard with heat maps, conversion funnels, and revenue forecasts
6. **Multi-Language Support** — Add Kinyarwanda and French translations using i18n
7. **Customer Loyalty Programme** — Points system rewarding repeat purchases
8. **Automated Order Emails** — Transactional emails for order confirmation, shipping updates, and delivery confirmation using Nodemailer
9. **Product Comparison** — Allow customers to compare up to 4 products side-by-side
10. **Advanced Inventory** — Low-stock alerts via email, automatic reorder triggers, warehouse management

---

### 15. Conclusion

AfriCraft Rwanda successfully demonstrates the development of a production-quality, full-stack e-commerce platform tailored to Rwanda's handicraft sector. The application meets all mandatory project requirements:

- ✅ **Responsive UI** with consistent branding and mobile-first design
- ✅ **Product Management** with search, filters, categories, and multi-image Cloudinary upload
- ✅ **Shopping Cart** with add, remove, quantity update, and automatic total calculation
- ✅ **Checkout Process** with form validation and order confirmation
- ✅ **Database Integration** with MongoDB — 9 collections covering all entities and relationships
- ✅ **GitHub Repository** with 80+ meaningful commits and complete documentation
- ✅ **Deployment** on Vercel (frontend) and Render (backend), both publicly accessible
- ✅ **CI/CD Pipeline** via GitHub Actions with automated build, test, and Docker verification
- ✅ **Docker Containerisation** with multi-stage Dockerfile and docker-compose orchestration

Beyond the baseline requirements, the project implements several bonus features earning additional marks:
- ✅ Multi-Vendor Marketplace with vendor and rider dashboards
- ✅ Analytics Dashboard with charts and revenue reporting
- ✅ Advanced Security (JWT, bcrypt, role-based access, input validation)
- ✅ Admin CMS for homepage content management

This project has been a comprehensive exercise in modern full-stack development, DevOps, and cloud deployment. It reinforced the importance of clean architecture, production-quality error handling, and user experience design.

> *"Whatever you do, work at it with all your heart, as working for the Lord, not for human masters."*
> — Colossians 3:23

---

## Local Development Setup

### Prerequisites
- Node.js 18+, npm 9+
- MongoDB (local) or MongoDB Atlas URI
- Docker Desktop (for containerised run)

### 1. Clone and Install

```bash
git clone https://github.com/charlenemacattoh2005-hub/africraft-rwanda.git
cd africraft-rwanda
npm run install:all
```

### 2. Configure Environment Variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env` minimum:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dellcraft
JWT_SECRET=your-secret-here
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=nyd9fgxr
CLOUDINARY_API_KEY=633921147819551
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

`client/.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 3. Seed the Database

```bash
npm run seed
```

### 4. Run Development Servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/health

### 5. Run with Docker

```bash
npm run docker:up
```

- App: http://localhost:8080
- API: http://localhost:5000

---

## Project Structure

```
africraft-rwanda/
├── client/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/        # Shared UI components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── ImageUpload.tsx
│   │   │   └── RequireAuth.tsx
│   │   ├── pages/             # Route page components
│   │   ├── services/          # API client & service functions
│   │   └── styles/            # CSS design system
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.production        # Production API URL
├── server/                    # Node.js + Express
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # Express routers
│   │   ├── middleware/        # auth, errorHandler, validate
│   │   └── lib/               # db.js, cloudinary.js
│   ├── scripts/               # Seed scripts
│   ├── Dockerfile
│   └── .env.example
├── docs/                      # Documentation
│   ├── DATABASE.md
│   ├── DEPLOYMENT.md
│   └── PROJECT_REPORT.md
├── .github/workflows/
│   └── ci-cd.yml              # GitHub Actions pipeline
├── docker-compose.yml
├── render.yaml                # Render deployment config
├── Procfile                   # Alternative Render start command
└── README.md
```

---

## Environment Variables Reference

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | API port (default: 5000) |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret (keep strong) |
| `JWT_EXPIRE` | No | Token expiry (default: `7d`) |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

### Client (`client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend API base URL |

---

## Scripts Reference

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend and backend in dev mode |
| `npm run start` | Start backend only (production) |
| `npm run build:client` | Build frontend for production |
| `npm run install:all` | Install all dependencies |
| `npm run seed` | Seed the database with sample data |
| `npm test` | Run backend tests |
| `npm run docker:up` | Start all Docker services |
| `npm run docker:down` | Stop all Docker services |

---

**Student:** Charlene Macattoh
**Course:** EWA408510 – E-Commerce and Web Application
**Institution:** Rwanda Coding Academy
**Year:** 2025–2026
**License:** MIT
