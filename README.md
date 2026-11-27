# OLMS – Lottery Management & Digital Ticketing System

**Version:** 1.0.0  
**Stack:** MERN (MongoDB · Express.js · React · Node.js)  
**Target:** Ethiopia (Telebirr & CBE payment integration)

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Running the Application](#running-the-application)
8. [User Roles](#user-roles)
9. [Payment Integration](#payment-integration)
10. [API Documentation](#api-documentation)
11. [Default Credentials](#default-credentials)

---

## Overview

The OLMS (Online Lottery Management System) is a secure, full-featured web application for authorized lottery operators. It provides end-to-end management of lottery events, digital tickets, draws, results, prize claims, and financial transactions — with full support for Ethiopian payment methods.

---

## Features

### 🔐 Authentication & Security
- JWT-based authentication (access + refresh tokens)
- Role-Based Access Control (RBAC) with 5 user roles
- Secure password hashing (bcrypt)
- Rate limiting & brute-force protection
- Comprehensive audit logging

### 🎟 Lottery Management
- Create and manage lottery events (Draft → Scheduled → Open → Closed → Drawn → Published)
- Digital ticket registration with unique ticket numbers
- Automated ticket number generation (TKT-YYYYMMDD-XXXXX)
- Duplicate prevention & ticket verification
- QR-based ticket verification

### 🎲 Draw Management
- Schedule and conduct authorized lottery draws
- Record draw results with full audit trail
- Automated winner identification

### 🏆 Prize & Claims
- Configure prize structures (multiple ranks)
- Prize claim submission and review workflow
- Status tracking: Submitted → Under Review → Approved → Paid

### 💳 Payments (Ethiopia)
- **Telebirr** – Ethiopian mobile money (Ethswitch API)
- **CBE Birr** – Commercial Bank of Ethiopia
- Cash payment support
- Idempotency controls to prevent duplicate charges
- Transaction receipts

### 📊 Reports & Analytics
- Role-specific dashboards with charts
- Ticket sales reports
- Financial transaction reports
- Prize claim reports
- Export to CSV and PDF

### 📧 Notifications
- Email notifications for key events
- In-app notification center
- Extensible notification architecture

---

## Project Structure

```
OLMS/
├── backend/                 # Node.js + Express.js API
│   ├── src/
│   │   ├── config/          # DB, JWT, Email config
│   │   ├── models/          # Mongoose schemas (12 collections)
│   │   ├── controllers/     # Business logic (13 controllers)
│   │   ├── routes/          # Express routes (13 route files)
│   │   ├── middleware/       # Auth, RBAC, Validation, Audit, Error
│   │   ├── services/        # Email, Payment, Report, Notification services
│   │   ├── validators/      # express-validator chains
│   │   └── utils/           # Helpers, constants, seed data
│   ├── server.js
│   └── package.json
│
├── frontend/                # React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── pages/           # 25+ pages across 4 role groups
│   │   ├── components/      # 40+ reusable UI components
│   │   ├── hooks/           # React Query hooks
│   │   ├── services/        # API service functions
│   │   ├── store/           # Zustand state (auth, UI)
│   │   ├── routes/          # React Router v6 config
│   │   └── lib/             # Axios instance, utilities
│   └── package.json
│
├── documentation/
│   ├── SRS.md               # Software Requirements Specification
│   └── API_Documentation.md
│
└── README.md
```

---

## Prerequisites

- **Node.js** v18+ 
- **MongoDB** v6+ (local or MongoDB Atlas)
- **npm** v9+
- Git

---

## Installation

### 1. Clone / Extract the project
```bash
cd OLMS
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

**Frontend:**
```bash
cd frontend
cp .env.example .env
# Edit .env with your values
```

### 5. Seed the Database (optional but recommended)
```bash
cd backend
npm run seed
```
This creates the default super admin and sample lottery data.

---

## Environment Variables

### Backend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/olms` |
| `JWT_ACCESS_SECRET` | JWT signing secret | `your_secret_key` |
| `JWT_REFRESH_SECRET` | Refresh token secret | `your_refresh_secret` |
| `JWT_ACCESS_EXPIRE` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRE` | Refresh token TTL | `7d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | SMTP username | `your@gmail.com` |
| `EMAIL_PASS` | SMTP password | `app_password` |
| `TELEBIRR_APP_ID` | Telebirr App ID | `from Ethswitch` |
| `TELEBIRR_APP_KEY` | Telebirr App Key | `from Ethswitch` |
| `TELEBIRR_SHORT_CODE` | Merchant short code | `from Ethswitch` |
| `TELEBIRR_PUBLIC_KEY` | RSA public key | `from Ethswitch` |
| `CBE_MERCHANT_ID` | CBE Merchant ID | `from CBE` |
| `CBE_API_KEY` | CBE API Key | `from CBE` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (`.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_APP_NAME` | Application name | `OLMS` |

---

## Running the Application

### Development

**Start Backend:**
```bash
cd backend
npm run dev        # starts on http://localhost:5000
```

**Start Frontend:**
```bash
cd frontend
npm run dev        # starts on http://localhost:3000
```

### Production

**Build Frontend:**
```bash
cd frontend
npm run build
```

**Start Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

---

## User Roles

| Role | Access Level | Key Permissions |
|---|---|---|
| `superAdmin` | Full system access | Manage all users, roles, audit logs, system settings |
| `lotteryAdmin` | Lottery operations | Create events, schedule draws, publish results |
| `cashManager` | Financial operations | Review transactions, approve prize claims, generate reports |
| `ticketAgent` | Ticket operations | Register tickets, verify tickets, generate receipts |
| `customer` | Self-service | View events, check results, submit prize claims |

---

## Payment Integration

### Telebirr (Ethswitch)
- Uses RSA encryption for secure API communication
- Supports push payment to customer phone
- Callback webhook for payment confirmation
- Endpoint: `POST /api/transactions/telebirr/initiate`
- Callback: `POST /api/transactions/telebirr/callback`

### CBE Birr
- Commercial Bank of Ethiopia mobile payment
- Endpoint: `POST /api/transactions/cbe/initiate`
- Callback: `POST /api/transactions/cbe/callback`

> **Note:** Real money transactions require operator licensing and approved payment arrangements. Configure credentials in `.env` before enabling live payments.

---

## API Documentation

Base URL: `http://localhost:5000/api`

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Create account |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/logout` | Auth | Logout |
| POST | `/auth/refresh-token` | Auth | Refresh access token |
| POST | `/auth/forgot-password` | Public | Request password reset |
| POST | `/auth/reset-password/:token` | Public | Reset password |
| GET | `/auth/me` | Auth | Get current user |

### Lottery Events
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/lottery-events` | Public | List events |
| POST | `/lottery-events` | lotteryAdmin+ | Create event |
| GET | `/lottery-events/:id` | Public | Get event |
| PUT | `/lottery-events/:id` | lotteryAdmin+ | Update event |
| PATCH | `/lottery-events/:id/status` | lotteryAdmin+ | Change status |
| DELETE | `/lottery-events/:id` | lotteryAdmin+ | Delete draft event |

### Tickets
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/tickets` | Auth | Register ticket |
| GET | `/tickets` | Admin | All tickets |
| GET | `/tickets/my` | Customer | My tickets |
| GET | `/tickets/:id` | Auth | Get ticket |
| POST | `/tickets/verify` | Auth | Verify ticket |
| GET | `/tickets/:id/receipt` | Auth | Download receipt PDF |

### Draws & Results
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/draws` | lotteryAdmin+ | Schedule draw |
| POST | `/draws/:id/results` | lotteryAdmin+ | Record results |
| POST | `/results/:id/publish` | lotteryAdmin+ | Publish results |
| GET | `/results` | Public | Published results |

### Prize Claims
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/prize-claims` | Customer | Submit claim |
| GET | `/prize-claims/my` | Customer | My claims |
| GET | `/prize-claims` | cashManager+ | All claims |
| PATCH | `/prize-claims/:id/approve` | cashManager+ | Approve claim |
| PATCH | `/prize-claims/:id/paid` | cashManager+ | Mark as paid |

### Transactions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/transactions/telebirr/initiate` | Auth | Start Telebirr payment |
| POST | `/transactions/telebirr/callback` | System | Telebirr webhook |
| POST | `/transactions/cbe/initiate` | Auth | Start CBE payment |
| POST | `/transactions/cbe/callback` | System | CBE webhook |
| GET | `/transactions` | cashManager+ | All transactions |
| GET | `/transactions/my` | Customer | My transactions |

### Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/reports/dashboard` | Admin+ | Dashboard stats |
| GET | `/reports/tickets` | Admin+ | Ticket sales report |
| GET | `/reports/financial` | cashManager+ | Financial report |
| GET | `/reports/claims` | cashManager+ | Claims report |
| GET | `/reports/export/csv` | Admin+ | Export CSV |
| GET | `/reports/export/pdf` | Admin+ | Export PDF |

---

## Default Credentials

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@olms.com` | `Admin@123456` |
| Lottery Admin | `lottoadmin@olms.com` | `Admin@123456` |
| Cash Manager | `finance@olms.com` | `Admin@123456` |
| Ticket Agent | `agent@olms.com` | `Admin@123456` |

> ⚠️ Change these credentials immediately in production!

---

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets for JWT keys in production
- Enable HTTPS in production (the system enforces HTTPS)
- Telebirr and CBE credentials must be obtained from official sources
- Real-money transactions require operator licensing

---

## License

This project is proprietary software for authorized lottery operators only. All lottery operations must comply with applicable laws and regulations.
