# AfriCraft Rwanda

This is a complete e-commerce web application for a Rwandan handicraft marketplace, built for **EWA408510 – E-Commerce and Web Application**.

The project enables customers to browse products, add items to a cart, checkout with validation, and view order history. It includes user authentication, MongoDB persistence, Docker containerization, and a CI/CD workflow.

## Live Links (update after deployment)

| Item | URL |
|------|-----|
| GitHub Repository | `https://github.com/charlenemacattoh2005-hub/africraft-rwanda` |
| Live Application | `https://africraft-web.onrender.com` |
| API Health | `https://africraft-api.onrender.com/health` |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, React Router |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcrypt |
| DevOps | Docker, docker-compose, GitHub Actions |

## Features

- Responsive UI with navigation and mobile-first layout
- Homepage, product listing, product details, cart, checkout, orders
- Product search, filtering, and category support
- Shopping cart: add, remove, update quantity, total calculation
- Checkout with customer details and validation
- User registration, login, JWT-based protected routes
- Order history and order detail pages
- Backend validation and error handling
- Docker containerization for API, client, and MongoDB
- CI/CD workflow for automated build and test

## Project Structure

```text
africraft-rwanda/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Express backend API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── scripts/seedProducts.js
│   ├── tests/
│   └── Dockerfile
├── docs/DATABASE.md
├── .github/workflows/ci-cd.yml
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB (local or Atlas)
- Docker Desktop (for containerized deployment)

## Local Setup

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Update `server/.env` with your MongoDB URI and JWT secret.

### 3. Seed products

```bash
npm run seed:products
```

### 4. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:5000/health

### 5. Test the app

1. Register / login
2. Browse products at `/products`
3. Add items to cart
4. Checkout at `/checkout`
5. View orders at `/orders`

## Docker Setup

Start the full stack:

```bash
npm run docker:up
```

- Web app: http://localhost:8080
- API: http://localhost:5000/health
- MongoDB: localhost:27017

Stop containers:

```bash
npm run docker:down
```

## CI/CD

A GitHub Actions workflow is configured in `.github/workflows/ci-cd.yml`.
It runs on push and pull request to `main`/`master` and performs:

1. Dependency install
2. Frontend build
3. Backend tests
4. Docker compose build

## Deployment Guide

### Backend

- Deploy `server/` as a web service
- Set build command: `npm install`
- Set start command: `npm start`
- Add env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `PORT=5000`

### Frontend

- Deploy `client/` as a static app
- Set `VITE_API_URL` to the backend API URL

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRE` | Token expiry (default 7d) |
| `CLIENT_URL` | Frontend URL for CORS |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client and server |
| `npm run build` | Build frontend |
| `npm run start` | Start backend server |
| `npm run seed:products` | Seed sample products |
| `npm test` | Run backend tests |
| `npm run docker:up` | Start Docker services |

## Database

See [docs/DATABASE.md](docs/DATABASE.md) for collection design.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for step-by-step deployment instructions (MongoDB Atlas + Render).

## Project Report

See [docs/PROJECT_REPORT.md](docs/PROJECT_REPORT.md) for the full academic project report.

## Project Report Checklist

Include in your final report:

1. Introduction
2. Problem statement
3. Objectives
4. System features
5. Technologies used
6. Architecture
7. Database design
8. Screenshots
9. GitHub repository link
10. Deployment link
11. CI/CD explanation
12. Docker implementation
13. Challenges
14. Future enhancements
15. Conclusion

---

## Notes

- Frontend build and backend tests are confirmed working.
- Docker build requires Docker Desktop to be running.
- Update the live links after deployment.

MIT
