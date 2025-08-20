"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, Clock, CheckCircle, PlayCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface DashboardStats {
  totalAgents: number
  totalTasks: number
  totalUploads: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  completionRate: number
  averageTasksPerAgent: number
}

export function EnhancedStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalTasks: 0,
    totalUploads: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    averageTasksPerAgent: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchStats()
    }
  }, [token])

  const cards = [
    {
      title: "Total Agents",
      value: stats.totalAgents,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: stats.totalAgents > 0 ? "+12%" : "0%",
    },
    {
      title: "Active Tasks",
      value: stats.inProgressTasks,
      icon: PlayCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: stats.inProgressTasks > 0 ? "+8%" : "0%",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: stats.completedTasks > 0 ? "+15%" : "0%",
    },
    {
      title: "Pending Tasks",
      value: stats.pendingTasks,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: stats.pendingTasks > 0 ? "-5%" : "0%",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : card.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    card.change.startsWith("+")
                      ? "text-green-600"
                      : card.change.startsWith("-")
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }
                >
                  {card.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{isLoading ? "..." : `${stats.completionRate.toFixed(1)}%`}</span>
              </div>
              <Progress value={stats.completionRate} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {stats.completedTasks} of {stats.totalTasks} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agent Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {isLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  stats.averageTasksPerAgent.toFixed(1)
                )}
              </div>
              <p className="text-xs text-muted-foreground">Average tasks per agent</p>
              <div className="flex items-center space-x-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  {stats.averageTasksPerAgent > 0 ? "+2.1% efficiency" : "No data yet"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
