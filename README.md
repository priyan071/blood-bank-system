# HemoVault | Centralized Blood Bank Management System

**College FSD MERN-Stack Project**  
**Institution:** Easwari Engineering College  
**Department:** Computer Science & Engineering (AIML), III – Year  
**Author:** Priyan R (Roll / Reg. No: `310624148072`)  
**Faculty Guide:** Ms. Divyanjali, Technical Trainer, CSE – AIML  

---

## Project Overview

**HemoVault** is a real-world, full-stack **Blood Bank Management System** engineered with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It digitizes and centralizes the entire blood transfusion lifecycle:

$$\text{Donor Registration} \rightarrow \text{Eligibility Check} \rightarrow \text{Appointment} \rightarrow \text{Phlebotomy Collection} \rightarrow \text{Lab Screening} \rightarrow \text{Cold Storage Inventory} \rightarrow \text{Emergency Request} \rightarrow \text{Fulfillment \& Issue} \rightarrow \text{Traceability Audit}$$

---

## Key Features & Modules

### 1. Multi-Role Portals
- **Admin / Medical Staff:**
  - Executive Dashboard with live MongoDB statistics (Available Units, Total Donors, Pending Tests, Critical Requests, Today's Appointments).
  - Real-time stock matrix across all 8 blood groups (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`).
  - Component-level inventory: Whole Blood (35 days), PRBC (42 days), Platelets (5 days), Plasma (1 year).
  - Phlebotomy blood collection & automated unit ID generator (`BLD-YYYY-XXXX`).
  - Pathology laboratory screening for 5 mandatory infectious disease markers (HIV, HBV, HCV, Syphilis, Malaria).
  - Priority Emergency Blood Request queue with instant stock allocation and negative inventory protection.
  - End-to-end unit lifecycle traceability and immutable audit log.
  - Performance & statutory analytics report generator with printable view.

- **Voluntary Donors:**
  - Personalized Donor Dashboard with next donation eligibility countdown.
  - Official Digital Donor Card.
  - Clinical Eligibility Self-Assessment Calculator (evaluates age, weight, hemoglobin, pulse, blood pressure, donation intervals).
  - Appointment scheduling with time slot selector.
  - Donation history and official Certificate of Blood Donation preview.

- **Hospitals / Requesters:**
  - Real-time blood availability finder across all blood groups and components.
  - Expedited Emergency Blood Request submission with urgency classification (`NORMAL`, `URGENT`, `CRITICAL`).
  - Order tracking timeline showing verified unit allocation and delivery status.

### 2. Built-in 1-Click Evaluation Logins
For seamless college viva, presentation, and lab evaluations, the top navigation banner features 1-click buttons to instantly switch between:
- **Admin:** `admin@bloodbank.org` / `Password@123`
- **Donor:** `priyan.donor@gmail.com` / `Password@123`
- **Hospital:** `apollo@hospital.org` / `Password@123`

---

## Technology Stack

- **Frontend:** React 18, React Router DOM v6, Axios, Lucide Icons, Modern Healthcare Design System (Vanilla CSS with custom tokens).
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs password hashing, Morgan logger.
- **Database & Models:** MongoDB & Mongoose:
  - `User`, `Donor`, `Appointment`, `BloodUnit`, `BloodTest`, `BloodRequest`, `Transaction`.
- **Zero-Setup Database Engine:** Supports external `MONGODB_URI` with automatic fallback to high-performance embedded `MongoMemoryServer` so it executes out-of-the-box on any machine.

---

## Directory Structure

```
blood-bank-system/
├── server/                   # Node.js + Express API Backend
│   ├── src/
│   │   ├── config/db.js      # Smart MongoDB connection
│   │   ├── controllers/      # Business logic (auth, donor, appointment, testing, inventory, request, transaction, dashboard, report)
│   │   ├── middleware/       # JWT protect, RBAC authorize, errorHandler
│   │   ├── models/           # Mongoose schemas (7 core collections)
│   │   ├── routes/           # REST API routes
│   │   ├── seeds/seed.js     # Realistic sample data populator
│   │   ├── utils/            # Eligibility algorithm, unit ID generator, audit logger
│   │   └── server.js         # Entrypoint
│   ├── .env.example
│   └── package.json
└── client/                   # React Vite Frontend SPA
    ├── src/
    │   ├── components/       # DemoBar, Navbar, Sidebar, StatusBadge, BloodGroupPill, Modal, ProtectedRoute
    │   ├── context/          # AuthContext with 1-click demo switcher
    │   ├── pages/
    │   │   ├── admin/        # Dashboard, Donors, Appointments, Lab Testing, Inventory, Requests, Traceability, Reports
    │   │   ├── donor/        # Dashboard, Eligibility, Book Appointment, History & Certificate
    │   │   └── requester/    # Dashboard, Blood Search, Emergency Request Form, My Requests
    │   ├── services/api.js   # Axios instance with JWT interceptors
    │   └── styles/index.css  # Healthcare red/white design system
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Running the Application Locally

### 1. Run the Backend:
```bash
cd server
npm install
npm run dev
# Server runs on http://localhost:5001
```

### 2. Run the Frontend:
```bash
cd client
npm install
npm run dev
# React Vite runs on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.
