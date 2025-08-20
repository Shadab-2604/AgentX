import { ProtectedRoute } from "@/components/layout/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { AdvancedTaskList } from "@/components/tasks/advanced-task-list"

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="p-6">
          <AdvancedTaskList />
        </div>
      </Sidebar>
    </ProtectedRoute>
  )
}
