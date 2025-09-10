import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { taskDistributionService } from "@/lib/task-distribution"
import { subAgentService } from "@/lib/subagents"

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get("uploadId")
    const agentId = searchParams.get("agentId")
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sort")?.split(":")[0] || "createdAt"
    const sortOrder = searchParams.get("sort")?.split(":")[1] || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // If logged-in user is an agent, scope to their sub-agent tasks and map subAgent -> agent for UI compatibility
    if (user.role === "agent") {
      const result = await subAgentService.getTasksByOwnerAgent(user._id, page, limit)
      const tasks = result.tasks.map((t: any) => ({
        ...t,
        agent: t.subAgent || null,
        assigneeType: "subagent",
      }))
      return NextResponse.json({
        success: true,
        tasks,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      })
    }

    // Build filter object
    const filters = {
      ...(uploadId && { uploadId }),
      ...(agentId && { agentId }),
      ...(status && status !== "all" && { status }),
      ...(priority && priority !== "all" && { priority }),
      ...(search && { search }),
    }

    if (uploadId) {
      // Get tasks by upload ID
      const tasksRaw = await taskDistributionService.getTasksByUploadId(uploadId)
      const tasks = tasksRaw.map((t: any) => ({ ...t, assigneeType: "agent" }))
      return NextResponse.json({
        success: true,
        tasks,
        total: tasks.length,
        page: 1,
        totalPages: 1,
      })
    }

    const result = await taskDistributionService.getFilteredTasks(filters, page, limit, sortBy, sortOrder)
    const mapped = {
      ...result,
      tasks: result.tasks.map((t: any) => ({ ...t, assigneeType: "agent" })),
    }
    return NextResponse.json({
      success: true,
      ...mapped,
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
