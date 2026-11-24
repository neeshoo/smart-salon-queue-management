# Smart Salon Queue Management System (MERN Stack)

> **MCA Final Year Major / Capstone Project**  
> A full-stack, real-time virtual queue and appointment scheduling platform designed to eliminate physical waiting lines in salons forever.

---

## 📌 Problem & Solution

* **The Problem:** Customers waste valuable hours physically sitting in crowded salon waiting rooms without knowing when their turn will arrive. Salon owners lack real-time visibility into queue volume, stylist load, and wait-time predictability.
* **The Solution:** Customers join a virtual queue from home, track their live queue position and accurate estimated wait time via WebSockets, and receive a smart **"Leave Now"** alert timed to their exact travel distance so they arrive just in time. Salon owners and stylists manage the queue in real-time from automated dashboards.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Socket.io-client, Recharts, Lucide React |
| **Backend** | Node.js, Express.js, Socket.io, Node-Cron, Nodemailer, QRCode, Helmet, CORS, Express-Rate-Limit |
| **Database** | MongoDB with Mongoose (Unique indexes, Atomic counter transactions) |
| **Auth** | JWT (JSON Web Tokens), bcrypt password hashing, Role-Based Access Control (RBAC) |

---

## 🏗 Complete Folder Tree

```text
smart-salon/
├── package.json
├── README.md
├── DEVELOPMENT_STATUS.md
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── .env
│   ├── seed.js
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Salon.js
│       │   ├── Service.js
│       │   ├── Staff.js
│       │   ├── Booking.js
│       │   ├── QueueCounter.js
│       │   ├── Review.js
│       │   └── Notification.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── errorHandler.js
│       │   └── validate.js
│       ├── utils/
│       │   ├── waitTime.js
│       │   ├── emailService.js
│       │   └── qrCode.js
│       ├── jobs/
│       │   └── cronJobs.js
│       ├── sockets/
│       │   └── socketHandler.js
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── salonController.js
│       │   ├── serviceController.js
│       │   ├── staffController.js
│       │   ├── queueController.js
│       │   ├── bookingController.js
│       │   ├── reviewController.js
│       │   ├── analyticsController.js
│       │   └── adminController.js
│       └── routes/
│           ├── authRoutes.js
│           ├── salonRoutes.js
│           ├── serviceRoutes.js
│           ├── staffRoutes.js
│           ├── queueRoutes.js
│           ├── bookingRoutes.js
│           ├── reviewRoutes.js
│           ├── analyticsRoutes.js
│           └── adminRoutes.js
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    ├── .env.example
    ├── .env
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   ├── AuthContext.jsx
        │   ├── SocketContext.jsx
        │   └── ThemeContext.jsx
        ├── services/
        │   └── api.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── LoadingSkeleton.jsx
        │   ├── Toast.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── LandingPage.jsx
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── SalonListPage.jsx
            ├── SalonDetailPage.jsx
            ├── JoinQueuePage.jsx
            ├── LiveTrackerPage.jsx
            ├── BookingPage.jsx
            ├── CustomerDashboardPage.jsx
            ├── StaffPanelPage.jsx
            ├── AdminDashboardPage.jsx
            ├── QueueManagerPage.jsx
            ├── ServicesStaffManagerPage.jsx
            ├── AnalyticsPage.jsx
            ├── SuperAdminPage.jsx
            └── NotFoundPage.jsx
```

---

## 🚀 Step-by-Step Run Instructions

### 1. Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Local MongoDB instance running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas connection URI

### 2. Backend Setup
```bash
# Navigate to the server folder
cd server

# Install dependencies
npm install

# (Optional) Verify .env file settings:
# MONGODB_URI=mongodb://127.0.0.1:27017/smart-salon
# PORT=5000

# Seed database with sample salons, services, staff, live queue, and historical analytics
npm run seed

# Start Express & Socket.io backend server
npm run dev
```
*Backend runs on:* `http://localhost:5000`

### 3. Frontend Setup (Open a second terminal)
```bash
# Navigate to client folder
cd client

# Install dependencies
npm install

# Start Vite React development server
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 🔑 Demo Login Credentials

The seed script creates ready-to-test accounts for every user role:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **Customer** | `customer@gmail.com` | `customer123` | Join queue, track live token, book appointments, leave reviews |
| **Staff (Stylist)** | `staff@luxe.com` | `staff123` | View assigned queue, Call Next, Start, Complete, Skip, No-Show |
| **Salon Admin** | `owner@luxe.com` | `owner123` | Floor manager, walk-ins, services, staff catalog, CSV export |
| **Super Admin** | `admin@smartsalon.com` | `admin123` | Platform oversight, approve/reject salons, manage user accounts |

*(Tip: On the `/login` page, click any of the 4 quick one-click demo login buttons to auto-populate credentials!)*

---

## 🧪 Testing Checklist

1. **Customer Virtual Queue Flow:**
   - Log in as `customer@gmail.com` / `customer123`.
   - Click **Browse Salons**, select *Luxe Hair & Spa Lounge*.
   - Click **Join Queue**, pick a service (e.g. *Signature Haircut*), adjust travel time slider to 15 mins, and submit.
   - Observe immediate token generation (`T-00X`) and redirect to the **Live Tracker** page.
   - Leave the browser tab open.

2. **Stylist & Real-time Synchronization:**
   - Open an Incognito window or another browser and log in as `staff@luxe.com` / `staff123`.
   - Go to `/staff/panel`.
   - Click **Call Next Customer**.
   - Notice that the customer tab instantly updates via Socket.io with a chime and status changing to **"YOUR TURN NOW!"** without any page reload.
   - Click **Start Service**, then **Complete Service**.
   - Customer tab updates to **"SERVICE COMPLETED"** with an invitation to submit a 5-star review.

3. **Auto No-Show Cron Verification:**
   - In `server/src/jobs/cronJobs.js`, the background job evaluates called tokens every 60 seconds. If a called token exceeds the salon's `autoNoShowMinutes` threshold, it is automatically marked `SKIPPED`, a warning notification is created, and the queue shifts forward.

4. **Analytics & CSV Export:**
   - Log in as `owner@luxe.com` / `owner123`.
   - Navigate to **Analytics** to view the Recharts Peak Hours moving average, customer volume, and stylist leaderboard.
   - Click **Export Complete CSV Report** to download the salon report spreadsheet.

---

## 🎓 5-Line Explanation of the Wait-Time Algorithm (For Viva)

1. **Active Staff Normalization:** The total available salon throughput is determined by counting staff members currently marked *Available* or *Busy* (\(N_{\text{staff}} \ge 1\)).
2. **In-Service Remaining Calculation:** For each ongoing service, the elapsed time since `serviceStartedAt` is subtracted from the learned duration to find true remaining minutes (\(T_{\text{active}}\)).
3. **Queue Duration Aggregation:** All waiting and called tokens ahead in queue are summed using each service's learned historical average completion time (\(T_{\text{waiting}} = \sum \text{avgActualDuration}\)).
4. **Formula:** Total estimated wait is accurately calculated as \(\text{WaitTime} = \frac{T_{\text{active}} + T_{\text{waiting}}}{N_{\text{staff}}}\).
5. **Smart Travel Alert Trigger:** When \(\text{WaitTime} \le \text{TravelTime} + 5\text{ mins}\), the engine fires a synchronized WebSocket and email **"Leave Now"** alert, ensuring zero salon waiting room congestion.
