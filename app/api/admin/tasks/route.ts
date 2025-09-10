import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { taskDistributionService } from "@/lib/task-distribution"
import { subAgentService } from "@/lib/subagents"

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const ownerAgentId = searchParams.get("ownerAgentId") || undefined

    const [adminTasks, subAgentTasksRaw] = await Promise.all([
      taskDistributionService.getAllTasks(page, limit),
      ownerAgentId
        ? subAgentService.getTasksByOwnerAgent(ownerAgentId, page, limit)
        : subAgentService.getAllSubAgentTasks(page, limit),
    ])

    const subAgentAssigned = {
      ...subAgentTasksRaw,
      tasks: (subAgentTasksRaw.tasks || []).map((t: any) => ({
        ...t,
        agent: t.agent ?? t.subAgent ?? null,
        assigneeType: "subagent",
      })),
    }

    return NextResponse.json({
      success: true,
      adminAssigned: adminTasks,
      subAgentAssigned,
    })
  } catch (error) {
    console.error("Admin tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}