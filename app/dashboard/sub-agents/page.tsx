import { ProtectedRoute } from "@/components/layout/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { SubAgentsManager } from "@/components/subagents/sub-agents-manager"

export default function SubAgentsPage() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sub-Agents</h1>
            <p className="text-muted-foreground">Manage your sub-agents and their capacities</p>
          </div>
          <SubAgentsManager />
        </div>
      </Sidebar>
    </ProtectedRoute>
  )
}
