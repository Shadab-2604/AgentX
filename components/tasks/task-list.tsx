"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { Search, Loader2, FileText, User } from "lucide-react"

interface Task {
  _id: string
  title: string
  description?: string
  status: "pending" | "in-progress" | "completed"
  createdAt: string
  agent: {
    _id: string
    name: string
    email: string
  } | null
}

interface Agent {
  _id: string
  name: string
  email: string
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const { token } = useAuth()

  // Only fetch agents, not subagents
  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents?limit=100", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents)
      }
    } catch (error) {
      console.error("Failed to fetch agents:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(selectedAgent !== "all" && { agentId: selectedAgent }),
      })

      const response = await fetch(`/api/tasks?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
        setTotal(data.total)
        setTotalPages(data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAgents()
    }
  }, [token])

  useEffect(() => {
    if (token) {
      fetchTasks()
    }
  }, [token, page, selectedAgent])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = search === "" || task.title.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tasks ({total})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent._id} value={agent._id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading tasks...</span>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tasks found.</p>
              {(search || selectedAgent !== "all" || statusFilter !== "all") && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearch("")
                    setSelectedAgent("all")
                    setStatusFilter("all")
                  }}
                  className="mt-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.map((task) => (
                      <TableRow key={task._id}>
                        <TableCell className="font-medium">{task.title}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {task.description || <span className="text-muted-foreground">No description</span>}
                        </TableCell>
                        <TableCell>
                          {task.agent?.name && (
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Assigned to {task.agent.name}</p>
                                <p className="text-xs text-muted-foreground">{task.agent?.email}</p>
                              </div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(task.status)}</TableCell>
                        <TableCell>{new Date(task.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, total)} of {total} tasks
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}