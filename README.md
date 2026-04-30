# Studies LMS — Learning Management System

A modern, full-stack Learning Management System built with React + Vite, Node.js/Express, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Recharts, Zustand |
| Backend | Node.js, Express.js, MVC architecture |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (access + refresh tokens), bcryptjs |
| File Upload | Multer (local storage, cloud-ready) |

---

## Features

- **Responsive Design** — Mobile-first, collapsible sidebar, touch-friendly
- **Landing Page** — Hero section, features, CTA buttons
- **Authentication** — Register, Login, JWT refresh tokens, protected routes
- **Role-Based Access** — Admin, Teacher, Student roles
- **Dashboard** — Live stats, Recharts (donut, bar, pie), leaderboard
- **Trainings** — Full CRUD, steps, media, progress tracking, ratings
- **Courses** — Full CRUD, enrollment, teacher assignment
- **Tests** — Full CRUD, take test, auto-grading, results
- **Questions** — Multiple choice, true/false, short answer
- **Results** — Score tracking, pass/fail, history
- **Notifications** — Toast + list, mark as read, delete
- **Users** — Admin user management
- **Profile** — Edit info, change password, avatar upload
- **Multi-language** — English & Arabic (RTL support)
- **File Upload** — Images and videos

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

## Setup & Run

### 1. Clone / Open the project

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the env file:
```bash
cp .env.example .env
```

Edit `.env` if needed (MongoDB URI, JWT secrets).

Start the backend:
```bash
npm run dev
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Open in browser

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/health

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | 123456 |
| Teacher | teacher@test.com | 123456 |
| Student | student@test.com | 123456 |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List users (admin/teacher) |
| GET | /api/users/:id | Get user |
| PUT | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user (admin) |

### Trainings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trainings | List trainings |
| GET | /api/trainings/:id | Get training |
| POST | /api/trainings | Create (admin/teacher) |
| PUT | /api/trainings/:id | Update (admin/teacher) |
| DELETE | /api/trainings/:id | Delete (admin/teacher) |
| POST | /api/trainings/:id/rate | Rate training |
| POST | /api/trainings/:id/progress | Update progress |

### Courses, Tests, Questions, Results
Similar CRUD patterns — see `/backend/routes/` for full details.

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/stats | Platform statistics |
| GET | /api/dashboard/leaderboard | Top students |

---

## Project Structure

```
studies-lms/
├── backend/
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routes
│   ├── scripts/         # Seed script
│   ├── uploads/         # File uploads
│   ├── .env             # Environment variables
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/  # Sidebar, Header, DashboardLayout
    │   │   └── ui/      # Reusable UI components
    │   ├── lib/         # API client, utils, i18n
    │   ├── pages/       # All page components
    │   ├── store/       # Zustand stores
    │   ├── App.jsx      # Router
    │   └── main.jsx     # Entry point
    ├── tailwind.config.js
    └── vite.config.js
```
