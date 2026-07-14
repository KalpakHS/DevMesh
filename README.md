# DevMesh — "Connect. Collaborate. Create."

DevMesh is a production-ready MERN stack collaboration and recruitment platform designed to help developers, students, and mentors discover collaborators, build portfolios, manage team workspaces, schedule sync meetings, and coordinate with recruiters. It integrates direct messaging, Kanban tracking, and structured evaluation into a unified, premium hub.

---

## 🛠️ Tech Stack
* **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons, Socket.IO-Client
* **Backend**: Node.js, Express.js (Modular Controllers, Routes, Socket Managers, and Services)
* **Database**: MongoDB & Mongoose ODM
* **Communication**: Real-Time Socket.IO (Presences, Typing states, Group Chat)
* **Security & Auth**: JWT double-token cookies, bcrypt passwords, helmet protection, Express-rate-limiters, input sanitization

---

## 🚀 Core Modules & Features

### 1. 🔐 Security & Password Management
* **JWT Double Token Auth**: Secure cookie-stored token pairs.
* **Forgot Password**: Password reset mailer with 15-minute expiring secure tokens. Strict password strength validation.
* **Change Password**: Change password form in **Settings → Security** checking the user's current password.

### 2. 👥 Developer & Team Workspace
* **Marketplace Discovery**: Filter, search, and sort options based on tags, roles, or difficulty.
* **Kanban Milestone Board**: Team ticketing lists featuring *To Do*, *In Progress*, and *Done* states.
* **Shared Files Repository**: Workspace file storage for document/asset sharing.

### 3. 👨‍🏫 Mentor Hub & Collaboration
* **Project Matching**: Apply as mentor, approve proposals, and evaluate project milestones.
* **Meeting Scheduler**: Integrated meeting calendar scheduling weekly syncs.
* **Ratings**: Interactive peer reviews out of 5 stars.

### 4. 💼 Recruiter Sourcing Pipeline
* **Candidate Sourcing**: Open developers list with full portfolios, HackerRank profiles, resume PDFs, and social indicators.
* **Shortlist States**: Move applications across Pipeline stages (*Shortlisted*, *Interview*, *Selected*, *Offer Sent*).
* **Private Notes**: Add candidate reviews.

---

## 🗂️ Project Directory Structure
```
devmesh/
├── backend/
│   ├── config/           # Database configurations
│   ├── controllers/      # Route controllers (Auth, Recruiter, Mentor, Project, Team, Chat)
│   ├── middleware/       # JWT auth filters, RBAC, limiters, error handling
│   ├── models/           # Mongoose schemas (User, Project, Team, Message, Job, Application, Interview, Shortlist, etc.)
│   ├── routes/           # REST routes definition
│   ├── services/         # Nodemailer SMTP and Gamification badge services
│   ├── sockets/          # Socket.io listeners
│   ├── utils/            # JWT generators and AppError handlers
│   ├── validators/       # Input sanitation schemas
│   └── server.js         # Entry point
└── frontend/
    ├── src/
    │   ├── components/   # Shared UI (Navbar, Footer, Modal, Protections)
    │   ├── context/      # Context APIs (Auth, Socket, Theme)
    │   ├── pages/        # Dashboard layouts (Workspaces, Settings, Sourcing, Shortlists)
    │   ├── utils/        # Axios API clients
    │   ├── App.jsx       # Routing configurations
    │   └── main.jsx      # Vite tree entry point
```

---

## 🔑 Demo Dataset Login Credentials

### 1. Admin Account
* **Email:** `admin@devconnect.local`
* **Password:** `Admin@123`

### 2. Student (Developer) Accounts
* **Kalpak H S:** `kalpakshivakumar@gmail.com` / `Kalpak@123` (Full Portfolio & Resume)
* **Manjunath Gowda:** `manjunath.gowda@devconnect.local` / `Manju@123`
* **Keerthana R:** `keerthana.r@devconnect.local` / `Keerthi@123`

### 3. Mentor Accounts
* **Dr. Shashidhar Hegde:** `shashidhar.hegde@sjbit.edu.in` / `Mentor@123` (Full-Stack/Cloud Specialist)
* **Prof. Kavitha M:** `kavitha.m@rvce.edu.in` / `Mentor@123` (AI/ML Specialist)
* **Prof. Ramesh Kumar N:** `ramesh.kumar@bmsce.ac.in` / `Mentor@123` (IoT Specialist)

### 4. Recruiter Accounts
* **Anand Prakash (Zensof):** `anand@zensoftech.com` / `Recruit@123`
* **Pooja Shetty (Razorpay):** `pooja@razorpay-demo.com` / `Recruit@123`
* **Naveen Kumar (Happiest Minds):** `naveen@happiestminds-demo.com` / `Recruit@123`

---

## 🛠️ Getting Started

### 1. Prerequisites
* **Node.js** (v18+)
* **MongoDB** instance running locally (`mongodb://127.0.0.1:27017/devmesh`)

### 2. Run Backend
1. Go to backend directory:
   ```bash
   cd backend
   ```
2. Install modules:
   ```bash
   npm install
   ```
3. Set environment configuration (`.env`):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/devmesh
   JWT_SECRET=supersecuresecretkeyshouldbechangedinproduction
   JWT_REFRESH_SECRET=supersecurerefreshsecretkeyshouldbechangedinproduction
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the server (includes automatic seeding of the Bengaluru Demo Dataset):
   ```bash
   npm start
   ```

### 3. Run Frontend
1. Go to frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install modules:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Open the browser at `http://localhost:5173`.

---

## 📝 License
This project is licensed under the terms of the [MIT License](LICENSE).
