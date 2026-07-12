# TransitOps 🚚💨

TransitOps is a modern, premium Fleet Operations and Logistics Management System. It offers real-time tracking, comprehensive lifecycle management for vehicles, drivers, and trips, fuel log audits, maintenance scheduling, and granular role-based access control (RBAC).

---

## 👥 Team Details & Hackathon

This project was built for **oddo heckathon 2026** by team **crewd**.

### Team Members
*   **Hetansh**
*   **Manan**
*   **Darsh**
*   **Drumil**

### Hashtags
`#heckathon2026` `#oddoheckathon`

---

##  Key Features

*   **Executive Dashboard**: High-level telemetry displaying total vehicles, active drivers, trips completed this month, pending maintenance, and key status metrics.
*   **Vehicle & Fleet Registry**: Complete lifecycle tracking for vehicles with region tagging, status management (`Available`, `On Trip`, `In Shop`, `Retired`), and odometer tracking.
*   **Driver Management**: License categorization (LMV, HMV), expiry notifications, active status toggles, safety scores, and automated dispatch eligibility checks.
*   **Smart Dispatch & Trips**: Step-by-step trip workflow management (`Draft`, `Dispatched`, `Completed`, `Cancelled`) with automated vehicle and driver status updates.
*   **Expense & Fuel Audits**: Fuel log recording (liters, total cost, price-per-liter calculation) and custom expense category mapping (tolls, permits, parking).
*   **Maintenance Logs**: Service scheduling, cost tracking, and automatic vehicle suspension during active maintenance periods.
*   **Role-Based Access Control (RBAC)**: Secure access tailored to team roles:
    *   `fleet_manager` - Full administrative privileges.
    *   `dispatcher` - Manages trips and driver assignments.
    *   `safety_officer` - Manages drivers, vehicles, and safety scores.
    *   `financial_analyst` - Audits expenses, fuel costs, and revenue reports.

---

##  Technology Stack

### Frontend (`/web`)
*   **Framework**: React (V19) with Vite
*   **Styling**: Tailwind CSS & Base UI
*   **Routing**: React Router DOM (V7)
*   **Icons**: Lucide React
*   **State & Queries**: React Context API & Axios client

### Backend (`/server`)
*   **Runtime**: Node.js & Express
*   **Database**: PostgreSQL
*   **ORM**: Drizzle ORM
*   **Authentication**: Secure JWT (Access & HttpOnly Refresh cookies)
*   **Process Manager**: Nodemon

---

## 📂 Project Structure

```
transitops/
├── server/                 # Backend Node/Express Server
│   ├── src/
│   │   ├── config/         # Database and app configurations
│   │   ├── controllers/    # API Controllers (auth, vehicles, trips, etc.)
│   │   ├── db/             # Drizzle schemas, migrations, and seeds
│   │   ├── middleware/     # Auth and RBAC middleware
│   │   └── routes/         # Express API routers
│   ├── .env.example        # Environment variables template
│   └── package.json
│
└── web/                    # Frontend React SPA
    ├── src/
    │   ├── api/            # API client wrappers
    │   ├── components/     # Reusable UI elements (table, dropdown, etc.)
    │   ├── context/        # React Context Providers (AuthContext)
    │   ├── layouts/        # Page shell designs (Dashboard & Auth Layouts)
    │   ├── lib/            # Utilities and permission maps
    │   └── pages/          # Individual app pages
    ├── .env                # API endpoint configuration
    └── package.json
```

---

##  Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm (v9+)
*   A running PostgreSQL Database instance (e.g., Neon Postgres, local Postgres)

---

### Backend Setup

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables. Create a `.env` file in the `/server` directory:
   ```env
   DATABASE_URL="your-postgresql-connection-string"
   JWT_ACCESS_SECRET="your-super-secure-access-secret"
   JWT_REFRESH_SECRET="your-super-secure-refresh-secret"
   PORT=3000
   ```

4. Run database migrations & seed demo data:
   ```bash
   # Run migrations using Drizzle Kit (if needed)
   npx drizzle-kit push
   
   # Seed the database with sample fleet data
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   *The backend will run on `http://localhost:3000`.*

---

### Frontend Setup

1. Navigate to the web folder:
   ```bash
   cd ../web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify environment configuration. Ensure the `.env` file in `/web` points to your backend URL:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`.*

---

## 👤 Demo Accounts

The seed script creates pre-configured accounts with different roles for testing purposes (password for all: `password123`):

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Fleet Manager** | `manager@transitops.demo` | Full Read/Write access to all modules. |
| **Dispatcher** | `dispatcher@transitops.demo` | Can dispatch and complete trips; read-only for logs. |
| **Safety Officer** | `safety@transitops.demo` | Can view and edit driver records, vehicle statuses, and safety scores. |
| **Financial Analyst** | `analyst@transitops.demo` | Can view and audit expenses, fuel logs, and financial metrics. |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
