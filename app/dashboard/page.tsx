import { ProtectedRoute } from "@/components/layout/protected-route"
import { Sidebar } from "@/components/layout/sidebar"
import { EnhancedStats } from "@/components/dashboard/enhanced-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus, Upload, Users, FileText } from "lucide-react"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Sidebar>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome to your AgentX admin dashboard</p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <a href="/dashboard/agents">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/dashboard/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </a>
              </Button>
            </div>
          </div>

          <EnhancedStats />

          <div className="grid gap-6 md:grid-cols-2">
            <RecentActivity />

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <a
                    href="/dashboard/agents"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Manage Agents</p>
                        <p className="text-sm text-muted-foreground">Add, edit, or remove agents</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                  <a
                    href="/dashboard/upload"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Upload className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium">Upload Files</p>
                        <p className="text-sm text-muted-foreground">Upload CSV, XLS, or XLSX files</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                  <a
                    href="/dashboard/tasks"
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">View Tasks</p>
                        <p className="text-sm text-muted-foreground">Monitor task distribution and progress</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Sidebar>
    </ProtectedRoute>
  )
}
