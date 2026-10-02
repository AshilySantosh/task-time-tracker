# Task & Time Tracker

A full-stack task and time tracking application that allows users to securely manage their tasks, track working sessions in real time, and view daily and weekly productivity analytics.

## 🚀 Live Demo

> (https://task-time-tracker-gray.vercel.app/login)

## Test credentials
email - testuser@gmail.com
password - password

## 📌 Features

### Authentication
- User signup and login
- Secure password hashing with bcrypt
- JWT-based authentication
- HTTP-only authentication cookies
- Protected API routes
- User-specific data isolation
- Logout functionality

### Task Management
- Create tasks
- View all personal tasks
- View individual tasks
- Edit task title and status
- Delete tasks
- Task statuses:
  - Pending
  - In Progress
  - Completed

### Time Tracking
- Start a timer for a task
- Stop the active timer
- Real-time elapsed timer
- Persistent time sessions
- Time history for each task
- Total tracked time per task
- Only one active timer per user

### Daily Dashboard
The dashboard provides:
- Tasks worked on today
- Total tracked time
- Completed tasks
- In-progress tasks
- Pending tasks

### Weekly Productivity Analytics
The application also provides a weekly productivity view with:
- Total tracked time
- Tasks worked on
- Completed tasks
- Daily time-tracking chart
- Most productive day

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Neon PostgreSQL

### Authentication & Security

- JWT
- HTTP-only cookies
- bcrypt
- Zod validation
- CORS
- User-level authorization

---

## 🏗️ Architecture

The backend follows a layered architecture:

```text
Client
  │
  ▼
Routes
  │
  ▼
Authentication Middleware
  │
  ▼
Validation
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ▼
Prisma ORM
  │
  ▼
PostgreSQL


🚀 Project Setup
git clone https://github.com/AshilySantosh/task-time-tracker.git
cd task-time-tracker

task-time-tracker/
├── backend/
├── frontend/
└── README.md

backend ----------------
cd backend
npm install
create backend/.env

DATABASE_URL=your_database_url
JWT_SECRET=your_secure_jwt_secret
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

npx prisma generate
npx prisma migrate dev
npm run dev

check - http://localhost:5000/health

frontend-----------------
cd frontend
npm install
create frontend/.env.local

NEXT_PUBLIC_API_URL=http://localhost:5000

npm run dev