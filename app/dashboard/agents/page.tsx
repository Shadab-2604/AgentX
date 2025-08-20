import { ProtectedRoute } from "@/components/layout/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { AgentList } from "@/components/agents/agent-list"

export default function AgentsPage() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground">Manage your agents and their information</p>
          </div>

          <AgentList />
        </div>
      </Sidebar>
    </ProtectedRoute>
  )
}
