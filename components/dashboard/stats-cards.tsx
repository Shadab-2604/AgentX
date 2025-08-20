"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Upload, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Stats {
  totalAgents: number
  totalTasks: number
  totalUploads: number
  completedTasks: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0,
    totalTasks: 0,
    totalUploads: 0,
    completedTasks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/agents/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setStats((prev) => ({
            ...prev,
            totalAgents: data.stats.totalAgents,
          }))
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
    },
    {
      title: "Active Tasks",
      value: stats.totalTasks,
      icon: FileText,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "File Uploads",
      value: stats.totalUploads,
      icon: Upload,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Completed Tasks",
      value: stats.completedTasks,
      icon: TrendingUp,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ]

  return (
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
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
