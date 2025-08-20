# AgentX - Task Management System

A professional MERN stack application for managing agents and distributing tasks through file uploads.

## Features

### Backend (Node.js + Express.js + MongoDB)
- **JWT Authentication**: Secure admin user system with token-based authentication
- **Agent Management**: Complete CRUD operations for managing agents (Name, Email, Mobile, Password)
- **File Upload System**: 
  - Support for CSV, XLS, and XLSX files
  - File validation and structure checking
  - Cloudinary integration for secure file storage
  - Automatic task distribution among agents
- **Task Distribution**: Intelligent algorithm to distribute tasks equally among available agents
- **Security**: Input validation, error handling, and security best practices

### Frontend (Next.js + React)
- **Modern UI**: Beautiful, professional interface with eye-catching colors
- **Authentication**: Login/register pages with JWT token management
- **Dashboard**: Comprehensive overview with statistics and quick actions
- **Agent Management**: 
  - Agent listing with search and pagination
  - Add, edit, and delete agents
  - Real-time updates and validation
- **File Upload**: 
  - Drag-and-drop interface
  - Progress tracking and validation
  - Upload history and management
- **Task Management**: 
  - Task listing with filtering by agent and status
  - Task distribution visualization
  - Export functionality
- **Advanced Features**:
  - Dark/light theme toggle
  - Toast notifications
  - Responsive design
  - Loading states and error handling

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, JWT
- **File Storage**: Cloudinary
- **File Processing**: XLSX library for parsing Excel files
- **Authentication**: JWT with bcrypt password hashing
- **UI Components**: shadcn/ui component library

## Project Structure

\`\`\`
agentx/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/route.ts    # Login endpoint
│   │   │   ├── register/route.ts # Registration endpoint
│   │   │   └── verify/route.ts   # Token verification
│   │   ├── agents/               # Agent management endpoints
│   │   │   ├── route.ts          # List/create agents
│   │   │   ├── [id]/route.ts     # Get/update/delete agent
│   │   │   └── stats/route.ts    # Agent statistics
│   │   ├── tasks/                # Task management endpoints
│   │   │   └── route.ts          # List/filter tasks
│   │   ├── upload/               # File upload endpoints
│   │   │   └── route.ts          # File upload and processing
│   │   └── uploads/              # Upload history endpoints
│   │       └── route.ts          # List upload history
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── page.tsx              # Dashboard overview
│   │   ├── agents/               # Agent management pages
│   │   │   └── page.tsx          # Agent list and management
│   │   ├── tasks/                # Task management pages
│   │   │   └── page.tsx          # Task list and filtering
│   │   ├── upload/               # File upload pages
│   │   │   └── page.tsx          # File upload interface
│   │   └── settings/             # Settings pages
│   │       └── page.tsx          # Application settings
│   ├── login/                    # Authentication pages
│   │   └── page.tsx              # Login page
│   ├── register/                 # Registration pages
│   │   └── page.tsx              # Registration page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles and design tokens
├── components/                   # Reusable React components
│   ├── auth/                     # Authentication components
│   │   ├── login-form.tsx        # Login form component
│   │   └── register-form.tsx     # Registration form component
│   ├── agents/                   # Agent management components
│   │   ├── agent-list.tsx        # Agent list with CRUD operations
│   │   ├── add-agent-dialog.tsx  # Add agent modal
│   │   ├── edit-agent-dialog.tsx # Edit agent modal
│   │   └── delete-agent-dialog.tsx # Delete confirmation modal
│   ├── dashboard/                # Dashboard components
│   │   ├── stats-cards.tsx       # Statistics cards
│   │   └── enhanced-stats.tsx    # Advanced analytics
│   ├── tasks/                    # Task management components
│   │   └── task-list.tsx         # Task list with filtering
│   ├── upload/                   # File upload components
│   │   ├── file-upload.tsx       # Drag-and-drop upload
│   │   └── upload-history.tsx    # Upload history display
│   ├── export/                   # Data export components
│   │   └── export-button.tsx     # Export functionality
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx           # Navigation sidebar
│   │   ├── theme-toggle.tsx      # Theme switcher
│   │   └── protected-route.tsx   # Route protection wrapper
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx            # Button component
│   │   ├── card.tsx              # Card component
│   │   ├── dialog.tsx            # Modal dialog component
│   │   ├── form.tsx              # Form components
│   │   ├── input.tsx             # Input component
│   │   ├── table.tsx             # Table component
│   │   ├── toast.tsx             # Toast notification
│   │   ├── toaster.tsx           # Toast container
│   │   └── skeleton.tsx          # Loading skeleton
│   └── theme-provider.tsx        # Theme context provider
├── lib/                          # Utility libraries and configurations
│   ├── auth.ts                   # JWT utilities and middleware
│   ├── auth-context.tsx          # Authentication context
│   ├── mongodb.ts                # MongoDB connection
│   ├── models.ts                 # Database models and schemas
│   ├── validation.ts             # Input validation schemas
│   ├── database.ts               # Database operations
│   ├── cloudinary.ts             # Cloudinary configuration
│   ├── file-parser.ts            # File parsing utilities
│   ├── task-distribution.ts      # Task distribution algorithm
│   └── utils.ts                  # General utilities
├── hooks/                        # Custom React hooks
│   ├── use-toast.ts              # Toast notification hook
│   └── use-mobile.tsx            # Mobile detection hook
├── docs/                         # Documentation
│   ├── API_DOCUMENTATION.md      # Complete API reference
│   ├── FRONTEND_GUIDE.md         # Frontend development guide
│   └── DEPLOYMENT_GUIDE.md       # Deployment instructions
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.mjs               # Next.js configuration
└── README.md                     # This file
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Cloudinary account

### Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/agentx

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
\`\`\`

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd agentx
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your MongoDB URI, JWT secret, and Cloudinary credentials

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Production Deployment

1. **Build the application**
   \`\`\`bash
   npm run build
   \`\`\`

2. **Start the production server**
   \`\`\`bash
   npm start
   \`\`\`

## Usage Guide

### Getting Started
1. **Create Admin Account**: Register a new admin account on the registration page
2. **Add Agents**: Navigate to the Agents page and add your team members
3. **Upload Files**: Go to the Upload page and drag-and-drop your CSV/Excel files
4. **Monitor Tasks**: View distributed tasks and track progress on the Tasks page

### File Format Requirements
Your CSV/Excel files should have the following structure:
- **Column 1**: Task Title (required)
- **Column 2**: Task Description (optional)

Example:
\`\`\`csv
Task Title,Description
"Complete project proposal","Draft and review the Q1 project proposal"
"Update client database","Add new client information to the system"
"Prepare monthly report","Compile and analyze monthly performance data"
\`\`\`

## Documentation

- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference with endpoints, request/response formats
- **[Frontend Guide](docs/FRONTEND_GUIDE.md)** - Component architecture, state management, and development patterns
- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Production deployment instructions and best practices

## Features in Detail

### Task Distribution Algorithm
The system automatically distributes uploaded tasks equally among available agents using a round-robin algorithm. If you have 5 agents and upload 23 tasks:
- Agents 1-3 will receive 5 tasks each
- Agents 4-5 will receive 4 tasks each

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- File type and size validation
- Protected API routes

### User Experience
- Responsive design for all screen sizes
- Loading states and progress indicators
- Error handling with user-friendly messages
- Toast notifications for actions
- Dark/light theme support
- Export functionality for data

## API Quick Reference

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Admin registration
- `GET /api/auth/verify` - Verify JWT token

### Agents
- `GET /api/agents` - List agents (with pagination and search)
- `POST /api/agents` - Create new agent
- `GET /api/agents/[id]` - Get specific agent
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent
- `GET /api/agents/stats` - Get agent statistics

### File Upload & Tasks
- `POST /api/upload` - Upload and process files
- `GET /api/tasks` - List tasks (with filtering)
- `GET /api/uploads` - List upload history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
# AgentX
