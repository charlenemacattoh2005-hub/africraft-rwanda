# Project Report
## AfriCraft Rwanda — E-Commerce Web Application
**Course:** EWA408510 – E-Commerce and Web Application
**Instructor:** Eric Maniraguha
**Student:** Charlene V. Mac-Attoh
**Student ID:** 23680/2024
**Submission Date:** [Date]

---

## 1. Introduction

AfriCraft Rwanda is a full-stack e-commerce web application built to bring authentic Rwandan handicrafts to an online marketplace. The platform connects local artisans with customers who want to discover, purchase, and celebrate handmade Rwandan products — from woven baskets and Imigongo wall art to beaded jewelry and traditional drums.

The application was developed as part of the EWA408510 course and demonstrates a complete, production-ready e-commerce system covering user authentication, product management, shopping cart, checkout, order tracking, and DevOps practices including Docker containerization and CI/CD automation.

---

## 2. Problem Statement

Rwanda has a rich tradition of handcraft artistry, yet many local artisans lack access to digital markets. Customers interested in authentic Rwandan products often have no reliable online platform to browse, compare, and purchase these goods. Existing general marketplaces do not cater specifically to Rwandan handicrafts, making it difficult for artisans to reach both local and international buyers.

There is a clear need for a dedicated, easy-to-use e-commerce platform that showcases Rwandan craftsmanship, supports secure transactions, and provides a seamless shopping experience from product discovery to order delivery.

---

## 3. Project Objectives

- Build a responsive, mobile-friendly e-commerce web application for Rwandan handicrafts.
- Implement full product management with categories, search, and filtering.
- Provide a complete shopping cart and checkout flow with form validation.
- Integrate user authentication with JWT-based protected routes.
- Store all data persistently using MongoDB with Mongoose ODM.
- Containerize the application using Docker and docker-compose.
- Automate build, test, and deployment using a GitHub Actions CI/CD pipeline.
- Deploy the application online and make it publicly accessible.

---

## 4. System Features

### Core Features
- **Homepage** — Hero section, featured products, best sellers, new arrivals, artisan profiles, testimonials, FAQ, and newsletter signup.
- **Product Listing** — Grid view with product images, badges (Featured, Best Seller, New Arrival), search by name/description, filter by category, price range, and sort options.
- **Product Details** — Full product page with image, description, stock status, star ratings, reviews, and add-to-cart functionality.
- **Shopping Cart** — Add, remove, update quantities, and view running totals. Persisted in localStorage.
- **Checkout** — Customer details form (name, phone, email, district, sector, address), payment method selection (MTN MoMo, Airtel Money, Cash on Delivery), delivery notes, and order summary.
- **Order Confirmation** — Order number, status, payment method, and total displayed after successful checkout.
- **Order History** — Authenticated users can view all past orders and individual order details.
- **User Authentication** — Register, login, JWT token management, and protected routes.
- **User Profile** — View and update account information.
- **Categories Page** — Browse products by category with emoji icons.
- **Wishlist** — Save products for later.
- **Product Reviews** — Submit and view star ratings and written reviews per product.

### Admin Features
- **Admin Dashboard** — Sales statistics and platform overview.
- **Order Management** — View and manage all customer orders.
- **Review Moderation** — Approve or reject product reviews.
- **Customer Management** — View registered customers.

### Bonus / Innovation Features
- **Payment Simulation** — Simulated MTN MoMo and Airtel Money payment flow.
- **AI-Suggested Products** — Product recommendation page.
- **Contact Page** — Customer support contact form.

---

## 5. Technologies Used

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, TypeScript | UI component framework |
| Frontend Build | Vite | Fast development server and bundler |
| Routing | React Router v6 | Client-side navigation |
| Backend | Node.js, Express | REST API server |
| Database | MongoDB, Mongoose | Data persistence and ODM |
| Authentication | JWT, bcrypt | Secure user auth and password hashing |
| Containerization | Docker, docker-compose | Multi-service container orchestration |
| CI/CD | GitHub Actions | Automated build, test, and deploy pipeline |
| Deployment | Render (API + Static), MongoDB Atlas | Cloud hosting |
| Web Server | Nginx | Serve React build in Docker |
| Version Control | Git, GitHub | Source control and collaboration |

---

## 6. System Architecture

The application follows a three-tier MERN stack architecture:

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                  │
│         React + TypeScript + Vite (Port 5173)        │
│  Pages: Home, Products, Cart, Checkout, Orders, Auth │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP REST API (JSON)
                       ▼
┌─────────────────────────────────────────────────────┐
│                  BACKEND (Express API)               │
│              Node.js + Express (Port 5000)           │
│  Routes: /api/auth, /api/products, /api/orders,      │
│          /api/categories, /api/reviews, /api/admin   │
│  Middleware: JWT auth, validation, error handler     │
└──────────────────────┬──────────────────────────────┘
                       │ Mongoose ODM
                       ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                  │
│         MongoDB Atlas / Local (Port 27017)           │
│  Collections: users, products, orders, reviews,      │
│               categories, wishlists                  │
└─────────────────────────────────────────────────────┘
```

In Docker, all three services run as containers orchestrated by docker-compose, with the frontend served by Nginx on port 8080, the API on port 5000, and MongoDB on port 27017.

---

## 7. Database Design

### Collections

**users**
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | Full name |
| `email` | String | Unique email address |
| `password` | String | bcrypt hashed password |
| `role` | String | `user` or `admin` |
| `createdAt` | Date | Registration timestamp |

**products**
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | Product name |
| `description` | String | Product description |
| `price` | Number | Price in RWF |
| `imageUrl` | String | Unsplash image URL |
| `category` | String | Product category |
| `stock` | Number | Available quantity |
| `badge` | String | Label (Featured, Best Seller, etc.) |
| `featured` | Boolean | Homepage featured flag |
| `isActive` | Boolean | Soft delete flag |

**orders**
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId | Reference to users |
| `orderNumber` | String | Human-readable order ID |
| `items` | Array | Array of `{productId, quantity, price}` |
| `customer` | Object | Delivery details |
| `total` | Number | Order total in RWF |
| `status` | String | pending / confirmed / delivered |
| `paymentMethod` | String | MTN MoMo / Airtel / Cash |

**reviews**
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `productId` | ObjectId | Reference to products |
| `userId` | ObjectId | Reference to users |
| `rating` | Number | 1–5 star rating |
| `comment` | String | Written review |
| `approved` | Boolean | Admin moderation flag |

**categories**
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary key |
| `name` | String | Category name |
| `icon` | String | Emoji icon |

---

## 8. Screenshots of the Application

> *(Include screenshots of the following pages in your final submission)*

1. Homepage — hero section and featured products
2. Products listing page with search and filters
3. Product details page with image and reviews
4. Shopping cart page
5. Checkout form
6. Order confirmation page
7. Order history page
8. Login and register pages
9. Admin dashboard
10. Docker running (`docker compose up`)
11. GitHub Actions CI/CD workflow passing

---

## 9. GitHub Repository Link

> **Repository:** `https://github.com/charlenemacattoh2005-hub/africraft-rwanda`

The repository contains:
- Full source code for client and server
- Dockerfile for both services
- docker-compose.yml for multi-service orchestration
- GitHub Actions CI/CD workflow (`.github/workflows/ci-cd.yml`)
- Complete README.md with setup instructions
- Database seed script (`server/scripts/seedProducts.js`)
- Environment variable examples (`.env.example`)

---

## 10. Deployment Link

> **Live Application:** `https://africraft-web.onrender.com`
> **API Health Check:** `https://africraft-api.onrender.com/health`

The application is deployed on **Render** (free tier):
- Backend: Render Web Service (Node.js)
- Frontend: Render Static Site (React build served via CDN)
- Database: MongoDB Atlas (free M0 cluster)

---

## 11. CI/CD Implementation

A GitHub Actions workflow is configured at `.github/workflows/ci-cd.yml`. It triggers automatically on every push or pull request to the `main`/`master` branch.

**Pipeline steps:**
1. **Checkout** — pulls the latest code from GitHub
2. **Setup Node.js 20** — installs the correct runtime with npm cache
3. **Install dependencies** — runs `npm run install:all` (installs both client and server packages)
4. **Build frontend** — runs `npm run build` to compile the React/TypeScript app with Vite
5. **Run backend tests** — runs `npm test --prefix server` (health check + product controller tests using Node's built-in test runner and mongodb-memory-server)
6. **Build Docker images** — runs `docker compose build` to verify both Dockerfiles build successfully

All steps must pass before a merge is allowed, ensuring code quality and build integrity on every commit.

---

## 12. Docker Implementation

The application is fully containerized using Docker with three services defined in `docker-compose.yml`:

**Services:**

| Service | Image | Port | Description |
|---|---|---|---|
| `mongo` | `mongo:7` | 27017 | MongoDB database |
| `api` | Custom (server/Dockerfile) | 5000 | Express REST API |
| `web` | Custom (client/Dockerfile) | 8080 | React app via Nginx |

**Backend Dockerfile** (`server/Dockerfile`):
- Base: `node:20-alpine`
- Installs production dependencies only (`--omit=dev`)
- Runs `node src/index.js`

**Frontend Dockerfile** (`client/Dockerfile`):
- Multi-stage build: Stage 1 builds the React app with Vite, Stage 2 serves the `dist/` folder with Nginx
- Accepts `VITE_API_URL` as a build argument for environment-specific API URLs

**To run the full stack with Docker:**
```bash
npm run docker:up
# Web app: http://localhost:8080
# API:     http://localhost:5000/health
# MongoDB: localhost:27017
```

---

## 13. Challenges Encountered

1. **Two source directories** — The project had both `server/` and `apps/backend/` directories. Docker and CI/CD used `server/`, while some edits were made to `apps/backend/`. This was resolved by keeping `server/` as the canonical backend and syncing all model and seed changes there.

2. **Featured products on homepage** — The initial homepage fetched products using `sort: 'new_arrivals'` and sliced the array, which did not correctly show featured products. This was fixed by adding `featured` and `badge` fields to the Product model and creating dedicated API query filters.

3. **CORS configuration** — During deployment, the frontend and backend run on different domains. The Express CORS middleware needed `CLIENT_URL` set correctly to allow cross-origin requests from the Render static site URL.

4. **Render free tier cold starts** — The free tier spins down inactive services after 15 minutes. The first request after inactivity takes ~30 seconds. This is acceptable for a demo/evaluation environment.

5. **Environment variables in Vite** — Vite requires environment variables to be prefixed with `VITE_` and baked in at build time. The `VITE_API_URL` must be set as a build argument in the Dockerfile and as an environment variable in the Render static site settings.

---

## 14. Future Enhancements

1. **Real payment gateway** — Integrate MTN MoMo API or Flutterwave for actual mobile money payments.
2. **Real-time notifications** — Use WebSockets or Server-Sent Events to notify users of order status changes.
3. **Progressive Web App (PWA)** — Add a service worker and manifest for offline support and installability.
4. **Multi-vendor marketplace** — Allow individual artisans to register as vendors and manage their own product listings.
5. **Analytics dashboard** — Track sales trends, top products, and customer behavior with charts.
6. **Email notifications** — Send order confirmation and shipping update emails via SendGrid or Nodemailer.
7. **Image uploads** — Replace Unsplash URLs with a real image upload system using AWS S3 or Cloudinary.
8. **Internationalization** — Add Kinyarwanda language support alongside English.

---

## 15. Conclusion

AfriCraft Rwanda successfully demonstrates a complete, production-ready e-commerce web application built with the MERN stack. The platform covers all required functional requirements — product management, shopping cart, checkout, user authentication, and order tracking — while also implementing all mandatory DevOps requirements including Docker containerization, GitHub Actions CI/CD, and cloud deployment.

The project goes beyond the base requirements by including bonus features such as product reviews, a wishlist, an admin dashboard, payment simulation, and AI-suggested products. The codebase is well-structured, documented, and follows modern web development best practices.

AfriCraft Rwanda demonstrates how technology can empower local Rwandan artisans by giving them a professional digital storefront, while providing customers with a seamless and trustworthy shopping experience.

---

*Report prepared for EWA408510 – E-Commerce and Web Application*
*Instructor: Eric Maniraguha*
