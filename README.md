# Ethira — Project Management App

A modern full-stack project management web app built with the **MERN Stack** and **Tailwind CSS**, featuring role-based access control (Admin/Member), task tracking, and team collaboration.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Styled_with-Tailwind_CSS-38B2AC?style=flat-square)

---

## ✨ Features

- **Authentication** — Signup/Login with JWT-based sessions
- **Role-Based Access** — Admin (full CRUD) vs Member (view & update status)
- **Project Management** — Create, edit, delete projects with team assignment
- **Task Tracking** — Kanban-style columns (Todo → In Progress → Done)
- **Dashboard** — Stats overview, completion rate, priority breakdown, recent tasks
- **Team Management** — View and manage team members (Admin only)
- **Overdue Detection** — Visual indicators for overdue tasks

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Express.js + Node.js |
| **Database** | MongoDB + Mongoose |
| **Auth** | JWT + bcryptjs |
| **Icons** | Lucide React |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas)

### 1. Clone & Install

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ethira
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### 3. Seed Database (Optional)

```bash
cd server
node seed.js
```

This creates sample data with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ethira.com | admin123 |
| Member | alice@ethira.com | member123 |
| Member | bob@ethira.com | member123 |

### 4. Run the App

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
Ethira/
├── client/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context provider
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Routes & layout
│   │   └── index.css         # Tailwind + custom styles
│   └── index.html
├── server/                   # Express Backend
│   ├── config/               # DB connection
│   ├── middleware/            # Auth & role guard
│   ├── models/               # Mongoose schemas
│   ├── routes/               # API endpoints
│   ├── seed.js               # Sample data seeder
│   └── index.js              # Server entry point
└── README.md
```

---

## 🔐 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register |
| `POST` | `/api/auth/login` | Public | Login |
| `GET` | `/api/auth/me` | Auth | Current user |
| `GET` | `/api/projects` | Auth | List projects |
| `POST` | `/api/projects` | Admin | Create project |
| `PUT` | `/api/projects/:id` | Admin | Update project |
| `DELETE` | `/api/projects/:id` | Admin | Delete project |
| `POST` | `/api/projects/:id/members` | Admin | Add member |
| `GET` | `/api/tasks` | Auth | List tasks |
| `POST` | `/api/tasks` | Admin | Create task |
| `PUT` | `/api/tasks/:id` | Auth | Update task |
| `DELETE` | `/api/tasks/:id` | Admin | Delete task |
| `GET` | `/api/users` | Admin | List users |
| `GET` | `/api/dashboard/stats` | Auth | Dashboard stats |
