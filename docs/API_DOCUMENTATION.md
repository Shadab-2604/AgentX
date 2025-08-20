# AgentX API Documentation

## Base URL
\`\`\`
http://localhost:3000/api
\`\`\`

## Authentication

All API endpoints except authentication routes require a valid JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Authentication Endpoints

### POST /api/auth/register
Register a new admin user.

**Request Body:**
\`\`\`json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securepassword123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "Admin Name",
    "email": "admin@example.com"
  }
}
\`\`\`

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
\`\`\`json
{
  "email": "admin@example.com",
  "password": "securepassword123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "Admin Name",
    "email": "admin@example.com"
  }
}
\`\`\`

### POST /api/auth/verify
Verify JWT token validity.

**Headers:**
\`\`\`
Authorization: Bearer <jwt-token>
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "Admin Name",
    "email": "admin@example.com"
  }
}
\`\`\`

## Agent Management Endpoints

### GET /api/agents
Get all agents with pagination and search.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term for name/email

**Response:**
\`\`\`json
{
  "success": true,
  "agents": [
    {
      "_id": "agent-id",
      "name": "Agent Name",
      "email": "agent@example.com",
      "mobile": "+1234567890",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalAgents": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`

### POST /api/agents
Create a new agent.

**Request Body:**
\`\`\`json
{
  "name": "New Agent",
  "email": "newagent@example.com",
  "mobile": "+1234567890",
  "password": "agentpassword123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Agent created successfully",
  "agent": {
    "_id": "new-agent-id",
    "name": "New Agent",
    "email": "newagent@example.com",
    "mobile": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

### GET /api/agents/[id]
Get a specific agent by ID.

**Response:**
\`\`\`json
{
  "success": true,
  "agent": {
    "_id": "agent-id",
    "name": "Agent Name",
    "email": "agent@example.com",
    "mobile": "+1234567890",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

### PUT /api/agents/[id]
Update an existing agent.

**Request Body:**
\`\`\`json
{
  "name": "Updated Agent Name",
  "email": "updated@example.com",
  "mobile": "+0987654321"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Agent updated successfully",
  "agent": {
    "_id": "agent-id",
    "name": "Updated Agent Name",
    "email": "updated@example.com",
    "mobile": "+0987654321",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

### DELETE /api/agents/[id]
Delete an agent.

**Response:**
\`\`\`json
{
  "success": true,
  "message": "Agent deleted successfully"
}
\`\`\`

### GET /api/agents/stats
Get agent statistics.

**Response:**
\`\`\`json
{
  "success": true,
  "stats": {
    "totalAgents": 25,
    "activeAgents": 20,
    "recentlyAdded": 3
  }
}
\`\`\`

## File Upload Endpoints

### POST /api/upload
Upload and process CSV/Excel files.

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file`
- Supported formats: CSV, XLS, XLSX
- Max file size: 10MB

**Response:**
\`\`\`json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "upload": {
    "_id": "upload-id",
    "filename": "tasks.csv",
    "originalName": "my-tasks.csv",
    "fileUrl": "https://cloudinary-url",
    "fileSize": 1024,
    "totalRows": 100,
    "processedRows": 100,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "distribution": {
    "totalTasks": 100,
    "agentsUsed": 5,
    "tasksPerAgent": {
      "agent-1-id": 20,
      "agent-2-id": 20,
      "agent-3-id": 20,
      "agent-4-id": 20,
      "agent-5-id": 20
    }
  }
}
\`\`\`

### GET /api/uploads
Get upload history.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
\`\`\`json
{
  "success": true,
  "uploads": [
    {
      "_id": "upload-id",
      "filename": "tasks.csv",
      "originalName": "my-tasks.csv",
      "fileUrl": "https://cloudinary-url",
      "fileSize": 1024,
      "totalRows": 100,
      "processedRows": 100,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalUploads": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`

## Task Management Endpoints

### GET /api/tasks
Get all tasks with filtering and pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `agentId` (optional): Filter by agent ID
- `uploadId` (optional): Filter by upload batch
- `search` (optional): Search in task descriptions

**Response:**
\`\`\`json
{
  "success": true,
  "tasks": [
    {
      "_id": "task-id",
      "description": "Task description from file",
      "assignedAgent": {
        "_id": "agent-id",
        "name": "Agent Name",
        "email": "agent@example.com"
      },
      "uploadId": "upload-id",
      "status": "pending",
      "rowData": {
        "column1": "value1",
        "column2": "value2"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalTasks": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
\`\`\`

## Error Responses

All endpoints return consistent error responses:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (in development)"
}
\`\`\`

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `500` - Internal Server Error

## Rate Limiting

- File uploads: 5 requests per minute per IP
- Authentication: 10 requests per minute per IP
- Other endpoints: 100 requests per minute per IP

## File Upload Specifications

### Supported File Formats
- **CSV**: Comma-separated values
- **XLS**: Excel 97-2003 format
- **XLSX**: Excel 2007+ format

### File Requirements
- Maximum file size: 10MB
- First row must contain headers
- At least one data row required
- Maximum 10,000 rows per file

### CSV Format Example
\`\`\`csv
Task Description,Priority,Category,Notes
Complete project documentation,High,Documentation,Include API docs
Review code changes,Medium,Development,Focus on security
Update user interface,Low,Design,Mobile responsive
\`\`\`

### Task Distribution Algorithm
1. Get all available agents
2. Calculate tasks per agent (total tasks ÷ agent count)
3. Distribute tasks evenly using round-robin
4. Handle remainder tasks by assigning to first agents
5. Save task assignments to database
