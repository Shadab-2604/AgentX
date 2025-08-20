# AgentX — Task Management System

A **Next.js (App Router) + MongoDB** application for managing agents and distributing tasks from CSV/Excel uploads. Built with a modern React UI, shadcn/ui components, and Cloudinary-backed file storage.

![AgentX](https://img.shields.io/badge/AgentX-Task%20Management-blue)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![MongoDB](https://img.shields.io/badge/Mongo-DB-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Highlights

- **Auth & Security**
  - JWT-based authentication (admin role)
  - Password hashing via bcrypt
  - Protected API routes with request authentication middleware
  - Input validation & sanitization (zod-based schemas)

- **Agent Operations**
  - Full CRUD (name, email, mobile, password)
  - Search, pagination, and statistics
  - Real-time UX with toasts and loading states

- **File Uploads**
  - Accepts **CSV, XLS, XLSX**
  - Client drag-and-drop with progress
  - File structure validation
  - Uploads persisted to **Cloudinary**

- **Task Distribution**
  - Round‑robin distribution across available agents
  - Filter + sort + paginate tasks
  - Per‑agent counts and status tracking
  - Export-ready lists

- **UX / DX**
  - Next.js App Router, **TypeScript**, Tailwind CSS
  - shadcn/ui + Radix primitives, Recharts for visuals
  - Light/Dark theme, responsive UI
  - Clean scripts: `dev`, `build`, `start`, `lint`

> **Note**: This project uses Next.js API Routes (serverless-style) instead of a separate Express server. Mongo access uses the official driver + Mongoose models.

---

## 🧱 Tech Stack

- **Frontend**: Next.js 15.2.4, React ^19, React‑DOM ^19, TypeScript ^5, Tailwind CSS ^4.1.9
- **Backend**: Next.js API Routes (Edge-compatible handlers)
- **Database**: MongoDB (official driver) + Mongoose models
- **Auth**: JWT + bcrypt
- **File Storage**: Cloudinary
- **Parsing**: `xlsx` for CSV/Excel
- **UI**: shadcn/ui, Radix, Sonner toasts, Recharts

---

## 📁 Project Structure (abridged)

```
agentx/
├── app/
│   ├── api/
│   │   ├── auth/                 # login, register, verify
│   │   ├── agents/               # list/create, stats, [id]
│   │   ├── tasks/                # list/filter, [id]
│   │   ├── upload/               # upload + distribute
│   │   └── uploads/              # history, [id]
│   ├── dashboard/                # overview + pages
│   │   ├── agents/
│   │   ├── tasks/
│   │   ├── upload/
│   │   └── settings/
│   ├── login/ | register/        # auth pages
│   ├── layout.tsx                # providers, theme
│   ├── page.tsx                  # landing
│   └── globals.css
├── components/                   # ui, widgets, forms
├── lib/                          # auth, db, models, parsing, distribution
├── hooks/                        # toasts, device utils
└── docs/                         # API, Frontend, Deployment guides
```

---

## 🗃️ Data Models (Mongoose)

**Agent**
- `name` *(string, required)*
- `email` *(string, required, unique)*
- `mobile` *(string, required)*
- `password` *(string, required, hashed)*
- Timestamps

**Task**
- `title` *(string, required)*
- `description` *(string)*
- `assignedTo` *(ObjectId → Agent, required)*
- `status` *(pending|in‑progress|completed; default: pending)*
- `priority` *(low|medium|high|urgent; default: medium)*
- `uploadId` *(ObjectId → Upload, required)*
- `notes`, `estimatedHours`, `actualHours`
- Timestamps

**Upload**
- `filename`, `originalName`, `cloudinaryUrl`
- `totalTasks`
- `uploadedBy` *(string)*
- Timestamp

**AdminUser**
- `name`, `email` *(unique)*, `password` *(hashed)*, `role` *(default: admin)*, createdAt

---

## 🔌 API Overview

> Base URL: `http://localhost:3000/api`

### Auth
- `POST /auth/login` – admin login → JWT
- `POST /auth/register` – admin onboard
- `GET  /auth/verify` – validate JWT

### Agents
- `GET  /agents` – list (pagination, search via `q`, `page`, `limit`)
- `POST /agents` – create
- `GET  /agents/[id]` – fetch one
- `PUT  /agents/[id]` – update
- `DELETE /agents/[id]` – delete
- `GET  /agents/stats` – counts/metrics

### Tasks
- `GET  /tasks` – filters: `uploadId`, `agentId`, `status`, `priority`, `search`, `sort=field:asc|desc`, `page`, `limit`
- `GET  /tasks/[id]` – fetch one (if implemented)

### Uploads
- `POST /upload` – multipart form: `file`
  - Validates type; parses CSV/XLS/XLSX; uploads raw file to Cloudinary; distributes tasks.
- `GET  /uploads` – history
- `GET  /uploads/[id]` – details for a single upload

> All non-auth routes require `Authorization: Bearer <token>`.

---

## 📦 File Format (CSV/Excel)

- **Column 1**: `Task Title` *(required)*
- **Column 2**: `Description` *(optional)*

**Example:**
```csv
Task Title,Description
"Complete project proposal","Draft and review the Q1 project proposal"
"Update client database","Add new client information to the system"
"Prepare monthly report","Compile and analyze monthly performance data"
```

---

## ⚙️ Environment Setup

Create `.env.local` at the repo root:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/agentx

# JWT
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Next
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

> **Security**: Do **not** commit real secrets. Use `.env.local` locally and proper secret stores in production (Vercel/Render/Env vars).

---

## 🚀 Getting Started

```bash
# 1) Install
npm install

# 2) Dev
npm run dev
# open http://localhost:3000

# 3) Production
npm run build
npm start
```

**Default scripts**
- `dev` – Next dev server
- `build` – Production build
- `start` – Start production server
- `lint` – Lint project

---

## 🧠 Task Distribution (Round‑Robin)

When you upload *N* tasks and have *M* agents:
- Each agent gets either `⌊N/M⌋` or `⌈N/M⌉` tasks.
- Example: 23 tasks, 5 agents → agents 1–3 get 5 tasks; 4–5 get 4 tasks.

Implementation uses a service that:
1. Parses and validates tasks
2. Cycles agents in order
3. Inserts tasks with `assignedTo`, `uploadId`, default `status`, `priority`

---

## 🛡️ Security Checklist

- Hash passwords (bcrypt)
- Validate input (zod)
- Verify JWT on every protected route
- Validate upload types/size; scan on server if required
- Use MongoDB indexes for unique fields (`email`)
- Keep secrets in env vars; rotate regularly

---

## 🧩 Frontend Notes

- Built with shadcn/ui + Radix + Tailwind
- Global theme provider with dark/light toggle
- Toast/loader patterns for clear feedback
- Dashboard pages:
  - **Overview**: key stats
  - **Agents**: CRUD with search/pagination
  - **Upload**: drag‑and‑drop, progress
  - **Tasks**: filters for agent/status/priority; export‑ready

---

## 🛫 Deployment

- **Vercel** (recommended for Next.js)
- Any Node host (PM2, Docker, Render, Railway)
- Ensure env vars set; connect to managed Mongo (Atlas)
- Configure Cloudinary credentials
- Consider image optimization settings and `images.unoptimized` in `next.config.mjs`

---

## 🧰 Troubleshooting

- `Invalid/Missing environment variable: "MONGODB_URI"` → set `MONGODB_URI` in `.env.local` or hosting provider.
- Build TS/ESLint errors: project is configured to **ignore** type/eslint build errors in `next.config.mjs` for DX; fix locally and remove ignores for stricter CI.
- Upload rejected: ensure file type is one of `.csv, .xls, .xlsx` and structure matches spec.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit with conventional messages
4. Add/adjust tests where applicable
5. Open a PR

---

## 📄 License

MIT – see `LICENSE`.

---

**AgentX** — streamline task distribution with a clean, secure, and scalable stack.
