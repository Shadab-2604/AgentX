import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { taskDistributionService } from "@/lib/task-distribution"

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
      const tasks = await taskDistributionService.getTasksByUploadId(uploadId)
      return NextResponse.json({
        success: true,
        tasks,
        total: tasks.length,
        page: 1,
        totalPages: 1,
      })
    }

    const result = await taskDistributionService.getFilteredTasks(filters, page, limit, sortBy, sortOrder)
    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Get tasks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
