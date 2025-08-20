# AgentX - Task Management System

A professional MERN stack application for managing agents and distributing tasks through file uploads with an intuitive dashboard and advanced analytics.

![AgentX](https://img.shields.io/badge/AgentX-Task%20Management-blue)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features Overview

### 🔐 Authentication & Security
- **JWT Authentication** with secure token management
- **Role-based access control** for admin users
- **Password hashing** with bcrypt algorithm
- **Input validation** and sanitization

### 👥 Agent Management
- **Complete CRUD operations** for agent management
- **Real-time agent statistics** and performance metrics
- **Search and pagination** for efficient browsing
- **Bulk operations** and export capabilities

### 📁 File Processing
- **Multi-format support** (CSV, XLS, XLSX)
- **Drag-and-drop interface** with progress tracking
- **Automatic validation** and structure checking
- **Cloud storage integration** with Cloudinary

### 📊 Task Distribution
- **Intelligent round-robin algorithm** for equal distribution
- **Visual task assignment** and tracking
- **Real-time updates** and status monitoring
- **Export functionality** for reports

## 🛠 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, MongoDB |
| **Authentication** | JWT with bcrypt |
| **File Processing** | XLSX library |
| **Cloud Storage** | Cloudinary |
| **UI Components** | shadcn/ui library |

## 📁 Project Structure

```
agentx/
├── app/
│   ├── api/                 # API Routes
│   ├── dashboard/           # Protected pages
│   ├── login/              # Auth pages
│   └── register/
├── components/             # Reusable components
├── lib/                   # Utilities & config
├── hooks/                 # Custom React hooks
└── docs/                  # Documentation
```

## ⚙️ Environment Configuration

Create a `.env.local` file with the following variables:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/agentx` |
| `JWT_SECRET` | Secret key for JWT tokens | [Your secure random string] |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `dyqwgdybd` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `692414312161942` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `eiQtZMvRIuR5omoFNYLDOJQxG0w` |
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:3000/api` |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- Cloudinary account

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shadab-2604/AgentX.git
   cd AgentX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   Navigate to `http://localhost:3000` in your browser

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Admin authentication |
| `POST` | `/api/auth/register` | Admin registration |
| `GET` | `/api/agents` | List all agents |
| `POST` | `/api/agents` | Create new agent |
| `PUT` | `/api/agents/[id]` | Update agent |
| `DELETE` | `/api/agents/[id]` | Delete agent |
| `POST` | `/api/upload` | File upload processing |
| `GET` | `/api/tasks` | List tasks with filters |

## 🎯 Usage Example

1. **Register Admin Account**
   - Navigate to `/register`
   - Create your admin account

2. **Add Agents**
   - Go to Dashboard → Agents
   - Click "Add Agent" and fill details

3. **Upload Tasks**
   - Visit Dashboard → Upload
   - Drag & drop CSV/Excel file
   - System automatically distributes tasks

4. **Monitor Progress**
   - Check Dashboard → Tasks
   - View task distribution and status

## 📊 File Format Requirements

CSV/Excel files should follow this structure:

| Column | Name | Required | Example |
|--------|------|----------|---------|
| 1 | Task Title | Yes | "Complete project proposal" |
| 2 | Description | No | "Draft and review Q1 proposal" |

**Example CSV:**
```csv
Task Title,Description
"Client Meeting","Prepare presentation for quarterly review"
"Code Review","Check new feature implementation"
"Documentation","Update API documentation"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/Shadab-2604/AgentX)
- [Issue Tracker](https://github.com/Shadab-2604/AgentX/issues)
- [API Documentation](/docs/API_DOCUMENTATION.md)

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**AgentX** - Streamlining task management and agent coordination through intelligent automation.