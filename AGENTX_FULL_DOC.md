# AgentX — Detailed Frontend & Backend Documentation

## 🖥️ Backend

AgentX uses **Next.js API Routes** as its backend (serverless-style). These routes connect to MongoDB and provide authentication, agent, task, and file management APIs.

### Folder Structure

```
/app/api/

- agents
  - route.ts
  - stats
    - route.ts
  - [id]
    - route.ts
- auth
  - login
    - route.ts
  - register
    - route.ts
  - verify
    - route.ts
- dashboard
  - stats
    - route.ts
- tasks
  - route.ts
  - [id]
    - route.ts
- upload
  - route.ts
- uploads
  - route.ts
  - [id]
    - route.ts

```

### Explanation of Folders & Files

- **auth/**: Authentication routes (login, register, verify).

- **agents/**: Agent management routes (CRUD, stats).

- **tasks/**: Task listing and filtering routes.

- **upload/**: File upload, parsing, and task distribution.

- **uploads/**: Upload history retrieval.


Each `route.ts` file exports `GET`, `POST`, `PUT`, or `DELETE` handlers implementing REST endpoints using Next.js conventions.

#### Key Modules (from `/lib`)

- **lib/auth.ts**: JWT creation/verification, middleware for protected routes.

- **lib/mongodb.ts**: Database connection utility.

- **lib/models.ts**: Mongoose schemas for Agents, Tasks, Uploads, AdminUser.

- **lib/validation.ts**: Input validation schemas (likely zod or yup).

- **lib/cloudinary.ts**: Cloudinary configuration & file handling.

- **lib/file-parser.ts**: Excel/CSV parsing with xlsx library.

- **lib/task-distribution.ts**: Implements round‑robin distribution.


---
## 🎨 Frontend

The frontend is built using **Next.js App Router** with React, TypeScript, Tailwind, and shadcn/ui. It provides a modern, responsive dashboard UI.

### Folder Structure (key parts)

```

- app
  - dashboard
    - 
    - agents
      - 
      - page.tsx
    - page.tsx
    - settings
      - 
      - page.tsx
    - tasks
      - 
      - page.tsx
    - upload
      - 
      - page.tsx
  - login
    - 
    - page.tsx
  - register
    - 
    - page.tsx
- components
  - 
  - agents
    - 
    - add-agent-dialog.tsx
    - agent-list.tsx
    - delete-agent-dialog.tsx
    - edit-agent-dialog.tsx
  - auth
    - 
    - login-form.tsx
    - register-form.tsx
  - dashboard
    - 
    - enhanced-stats.tsx
    - recent-activity.tsx
    - stats-cards.tsx
  - export
    - 
    - export-button.tsx
  - layout
    - 
    - protected-route.tsx
    - sidebar.tsx
    - theme-toggle.tsx
  - tasks
    - 
    - advanced-task-list.tsx
    - task-list.tsx
  - theme-provider.tsx
  - ui
    - 
    - accordion.tsx
    - alert-dialog.tsx
    - alert.tsx
    - aspect-ratio.tsx
    - avatar.tsx
    - badge.tsx
    - breadcrumb.tsx
    - button.tsx
    - calendar.tsx
    - card.tsx
    - carousel.tsx
    - chart.tsx
    - checkbox.tsx
    - collapsible.tsx
    - command.tsx
    - context-menu.tsx
    - dialog.tsx
    - drawer.tsx
    - dropdown-menu.tsx
    - form.tsx
    - hover-card.tsx
    - input-otp.tsx
    - input.tsx
    - label.tsx
    - menubar.tsx
    - navigation-menu.tsx
    - pagination.tsx
    - popover.tsx
    - progress.tsx
    - radio-group.tsx
    - resizable.tsx
    - scroll-area.tsx
    - select.tsx
    - separator.tsx
    - sheet.tsx
    - sidebar.tsx
    - skeleton.tsx
    - slider.tsx
    - sonner.tsx
    - switch.tsx
    - table.tsx
    - tabs.tsx
    - textarea.tsx
    - toast.tsx
    - toaster.tsx
    - toggle-group.tsx
    - toggle.tsx
    - tooltip.tsx
    - use-mobile.tsx
    - use-toast.ts
  - upload
    - 
    - enhanced-file-upload.tsx
    - file-upload.tsx
    - upload-history.tsx
- hooks
  - 
  - use-mobile.ts
  - use-toast.ts
- lib
  - 
  - auth-context.tsx
  - auth.ts
  - cloudinary.ts
  - database.ts
  - file-parser.ts
  - models.ts
  - mongodb.ts
  - task-distribution.ts
  - utils.ts
  - validation.ts

```

### Explanation of Folders & Files

- **app/dashboard/**: Protected pages (overview, agents, tasks, upload, settings).

- **app/login/**, **app/register/**: Authentication pages.

- **components/**: Reusable UI components grouped by domain:

  - **auth/**: login/register forms

  - **agents/**: CRUD dialogs and lists for agents

  - **dashboard/**: stat cards and analytics components

  - **tasks/**: task list, filters

  - **upload/**: drag‑and‑drop uploader, upload history

  - **layout/**: sidebar, theme toggle, route protection

  - **ui/**: shared primitives (button, card, dialog, form, input, table, toast, skeleton)

- **hooks/**: custom hooks like `use-toast`, `use-mobile`.

- **lib/**: client-side utils (auth context, API calls, etc.).

#### Key UX Flows

1. **Login/Register** → JWT saved client-side

2. **Dashboard** → Shows stats, agent/task lists

3. **File Upload** → Drag CSV/XLSX → POST to `/api/upload` → tasks auto-distributed

4. **Task Management** → filter by agent/status → update statuses


---
## 📌 Important Code Modules & Explanations

- **components/layout/protected-route.tsx**: HOC that checks auth context and redirects if not logged in.

- **lib/auth-context.tsx**: Provides JWT state and helpers to frontend.

- **components/upload/file-upload.tsx**: Implements drag‑and‑drop, progress bar, sends file to backend.

- **components/tasks/task-list.tsx**: Renders paginated + filterable task list.

- **lib/task-distribution.ts**: (Backend) Implements round‑robin assignment with examples.


---
## 🔑 Example Code Snippets

### 1. Authentication (JWT Creation)
```ts
// lib/auth.ts
import jwt from "jsonwebtoken";

export function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return null;
  }
}
```
➡️ Used in `app/api/auth/login/route.ts` and `app/api/auth/register/route.ts`.

---

### 2. MongoDB Connection
```ts
// lib/mongodb.ts
import mongoose from "mongoose";

let cached = global.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI!).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```
➡️ Ensures **singleton DB connection** for serverless environments.

---

### 3. Task Distribution Algorithm (Round Robin)
```ts
// lib/task-distribution.ts
export function distributeTasks(tasks, agents) {
  const distributed = [];
  let i = 0;
  for (const task of tasks) {
    const agent = agents[i % agents.length];
    distributed.push({ ...task, assignedTo: agent._id });
    i++;
  }
  return distributed;
}
```
➡️ Evenly distributes tasks among available agents.

---

### 4. File Upload & Parsing
```ts
// app/api/upload/route.ts
import { parseFile } from "@/lib/file-parser";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  // Validate file type
  const tasks = await parseFile(file);
  // Save file in Cloudinary
  // Distribute tasks to agents
  // Insert into DB
}
```
➡️ Accepts CSV/XLSX, parses with **xlsx**, uploads raw file to **Cloudinary**.

---

### 5. Protected Route on Frontend
```tsx
// components/layout/protected-route.tsx
"use client";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) router.push("/login");
  return <>{children}</>;
}
```
➡️ Ensures only logged-in admins can access dashboard pages.

---

## 🔄 Flow Diagrams

### 1. Login Flow
```
[Login Page] → (POST /api/auth/login) → [Verify User + JWT] → [Return Token]
      ↓
[Save Token in Auth Context] → [Access Protected Routes]
```

### 2. File Upload & Task Distribution
```
[Frontend Upload Component] → (POST /api/upload)
      ↓
 [Validate File] → [Parse CSV/XLSX] → [Cloudinary Upload]
      ↓
 [Distribute Tasks Round Robin] → [Save Tasks in DB]
      ↓
 [Return Success + UploadId]
      ↓
 [Frontend Updates Upload History + Tasks Page]
```

### 3. Task Filtering
```
[Dashboard Tasks Page] → (GET /api/tasks?agentId=&status=&priority=)
      ↓
 [Backend Queries MongoDB with Filters]
      ↓
 [Paginated Tasks Returned]
      ↓
 [Rendered in Task List with Export Options]
```

---
## 📖 Summary

- Backend handled fully inside **Next.js API Routes** (auth, agents, tasks, uploads).
- Frontend provides **Dashboard UI** with pages for agents, tasks, upload, and settings.
- **Core modules**: JWT auth, MongoDB, task distribution, file parsing, Cloudinary integration.
- **Flows**: login/auth, upload → distribution, task filtering & management.

---

**This combined documentation covers:**
1. Folder structures (frontend & backend)
2. File/module responsibilities
3. Example code snippets
4. Flow diagrams for main features
