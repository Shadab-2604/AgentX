# Frontend Development Guide

## Architecture Overview

The AgentX frontend is built with Next.js 14 using the App Router, TypeScript, and Tailwind CSS. It follows a component-based architecture with clear separation of concerns.

## Component Structure

### Layout Components (`components/layout/`)

#### Sidebar (`sidebar.tsx`)
- **Purpose**: Main navigation sidebar with collapsible functionality
- **Features**: 
  - Responsive design (mobile drawer, desktop sidebar)
  - Active route highlighting
  - Theme toggle integration
  - User profile section
- **Usage**: Automatically included in dashboard layout

#### Theme Toggle (`theme-toggle.tsx`)
- **Purpose**: Switch between light and dark themes
- **Features**: 
  - Smooth theme transitions
  - System theme detection
  - Persistent theme preference
- **Usage**: Integrated in sidebar and can be used anywhere

#### Protected Route (`protected-route.tsx`)
- **Purpose**: Wrapper component for authentication-required pages
- **Features**: 
  - Automatic redirect to login if not authenticated
  - Loading states during auth check
  - Token validation
- **Usage**: Wraps all dashboard pages

### Authentication Components (`components/auth/`)

#### Login Form (`login-form.tsx`)
- **Purpose**: User authentication form
- **Features**: 
  - Form validation with Zod
  - Error handling and display
  - Loading states
  - Remember me functionality
- **Validation**: Email format, password requirements

#### Register Form (`register-form.tsx`)
- **Purpose**: New user registration form
- **Features**: 
  - Multi-field validation
  - Password confirmation
  - Real-time validation feedback
  - Success/error messaging
- **Validation**: Name, email uniqueness, password strength

### Agent Management Components (`components/agents/`)

#### Agent List (`agent-list.tsx`)
- **Purpose**: Display and manage agents with full CRUD operations
- **Features**: 
  - Pagination with customizable page size
  - Real-time search functionality
  - Sorting by name, email, creation date
  - Bulk actions support
  - Responsive table design
- **State Management**: Local state for filters, pagination

#### Add Agent Dialog (`add-agent-dialog.tsx`)
- **Purpose**: Modal form for creating new agents
- **Features**: 
  - Form validation with real-time feedback
  - Duplicate email detection
  - Password generation option
  - Success/error handling
- **Integration**: Refreshes agent list on success

#### Edit Agent Dialog (`edit-agent-dialog.tsx`)
- **Purpose**: Modal form for updating existing agents
- **Features**: 
  - Pre-populated form fields
  - Partial update support
  - Optimistic UI updates
  - Validation with existing data check
- **Data Flow**: Receives agent data as props

#### Delete Agent Dialog (`delete-agent-dialog.tsx`)
- **Purpose**: Confirmation modal for agent deletion
- **Features**: 
  - Safety confirmation with agent name
  - Cascade deletion warning
  - Undo functionality (if applicable)
  - Loading states during deletion
- **Safety**: Prevents accidental deletions

### Dashboard Components (`components/dashboard/`)

#### Stats Cards (`stats-cards.tsx`)
- **Purpose**: Display key metrics and statistics
- **Features**: 
  - Real-time data updates
  - Animated counters
  - Trend indicators
  - Responsive grid layout
- **Metrics**: Agent count, task distribution, completion rates

#### Enhanced Stats (`enhanced-stats.tsx`)
- **Purpose**: Advanced analytics and charts
- **Features**: 
  - Interactive charts with Recharts
  - Time-based filtering
  - Export functionality
  - Drill-down capabilities
- **Charts**: Bar charts, pie charts, line graphs

### Task Management Components (`components/tasks/`)

#### Task List (`task-list.tsx`)
- **Purpose**: Display and filter distributed tasks
- **Features**: 
  - Advanced filtering (agent, status, date range)
  - Search functionality
  - Pagination with infinite scroll option
  - Task status updates
  - Bulk operations
- **Filters**: Agent assignment, completion status, upload batch

### File Upload Components (`components/upload/`)

#### File Upload (`file-upload.tsx`)
- **Purpose**: Drag-and-drop file upload interface
- **Features**: 
  - Drag-and-drop zone
  - File type validation
  - Progress tracking
  - Multiple file support
  - Preview functionality
- **Supported Types**: CSV, XLS, XLSX
- **Validation**: File size, format, content structure

#### Upload History (`upload-history.tsx`)
- **Purpose**: Display previous file uploads and their status
- **Features**: 
  - Upload timeline
  - Processing status
  - Download original files
  - Reprocess functionality
  - Error logs display
- **Data**: Upload metadata, processing results

### Export Components (`components/export/`)

#### Export Button (`export-button.tsx`)
- **Purpose**: Data export functionality
- **Features**: 
  - Multiple export formats (CSV, Excel, PDF)
  - Custom field selection
  - Date range filtering
  - Progress indication
  - Download management
- **Formats**: CSV for data, PDF for reports

## State Management

### Authentication Context (`lib/auth-context.tsx`)

\`\`\`typescript
interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}
\`\`\`

**Features:**
- JWT token management
- Automatic token refresh
- Persistent authentication state
- Loading states
- Error handling

**Usage:**
\`\`\`typescript
const { user, login, logout, isLoading } = useAuth()
\`\`\`

### Local State Patterns

#### Form State Management
\`\`\`typescript
// Using React Hook Form with Zod validation
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: initialValues
})
\`\`\`

#### List State Management
\`\`\`typescript
// Pagination and filtering state
const [currentPage, setCurrentPage] = useState(1)
const [searchTerm, setSearchTerm] = useState('')
const [filters, setFilters] = useState<FilterState>({})
\`\`\`

## Styling System

### Design Tokens (`app/globals.css`)

The application uses a comprehensive design token system:

\`\`\`css
:root {
  --primary: oklch(0.35 0.08 200);     /* Cyan-800 */
  --secondary: oklch(0.65 0.15 35);    /* Bright Orange */
  --accent: oklch(0.65 0.15 35);       /* Orange accent */
  --background: oklch(0.98 0.02 195);  /* Light cyan bg */
  --foreground: oklch(0.35 0.05 220);  /* Dark gray text */
}
\`\`\`

### Component Styling Patterns

#### Responsive Design
\`\`\`typescript
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
\`\`\`

#### Theme-Aware Styling
\`\`\`typescript
// Automatic dark/light theme support
<div className="bg-background text-foreground border-border">
\`\`\`

#### Interactive States
\`\`\`typescript
// Hover and focus states
<button className="hover:bg-primary/90 focus:ring-2 focus:ring-primary/20">
\`\`\`

## Performance Optimizations

### Code Splitting
- Automatic route-based code splitting with Next.js App Router
- Dynamic imports for heavy components
- Lazy loading for non-critical components

### Data Fetching
\`\`\`typescript
// Server-side data fetching
async function getData() {
  const res = await fetch('/api/agents', { cache: 'no-store' })
  return res.json()
}

// Client-side with SWR pattern
const { data, error, mutate } = useSWR('/api/agents', fetcher)
\`\`\`

### Image Optimization
\`\`\`typescript
// Next.js Image component with optimization
<Image
  src="/placeholder.svg"
  alt="Description"
  width={400}
  height={300}
  className="rounded-lg"
/>
\`\`\`

## Form Handling

### Validation Schema Example
\`\`\`typescript
const agentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  mobile: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters")
})
\`\`\`

### Form Component Pattern
\`\`\`typescript
function AgentForm({ onSubmit, initialData }) {
  const form = useForm({
    resolver: zodResolver(agentSchema),
    defaultValues: initialData
  })

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data)
      toast.success("Agent saved successfully")
      form.reset()
    } catch (error) {
      toast.error("Failed to save agent")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
\`\`\`

## Error Handling

### Error Boundary Pattern
\`\`\`typescript
function ErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Error caught by boundary:', error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
\`\`\`

### API Error Handling
\`\`\`typescript
async function apiCall() {
  try {
    const response = await fetch('/api/endpoint')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    toast.error('Something went wrong')
    throw error
  }
}
\`\`\`

## Testing Patterns

### Component Testing
\`\`\`typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { AgentList } from './agent-list'

test('renders agent list with data', () => {
  render(<AgentList agents={mockAgents} />)
  expect(screen.getByText('Agent Name')).toBeInTheDocument()
})
\`\`\`

### Integration Testing
\`\`\`typescript
test('creates new agent successfully', async () => {
  render(<AddAgentDialog />)
  
  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'New Agent' }
  })
  
  fireEvent.click(screen.getByText('Save'))
  
  await waitFor(() => {
    expect(screen.getByText('Agent created successfully')).toBeInTheDocument()
  })
})
\`\`\`

## Accessibility Features

### ARIA Labels and Roles
\`\`\`typescript
<button
  aria-label="Delete agent"
  aria-describedby="delete-description"
  role="button"
>
  <Trash2 className="h-4 w-4" />
</button>
\`\`\`

### Keyboard Navigation
\`\`\`typescript
<div
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
\`\`\`

### Screen Reader Support
\`\`\`typescript
<span className="sr-only">Loading agents...</span>
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
\`\`\`

## Development Workflow

### Component Development
1. Create component in appropriate directory
2. Add TypeScript interfaces
3. Implement component logic
4. Add styling with Tailwind
5. Add error handling
6. Write tests
7. Update documentation

### Best Practices
- Use TypeScript for all components
- Follow the established naming conventions
- Implement proper error boundaries
- Add loading states for async operations
- Ensure responsive design
- Test accessibility features
- Document complex logic
