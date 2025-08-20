import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Agent, Task, Upload } from "@/lib/models"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Get all stats in parallel
    const [totalAgents, totalTasks, completedTasks, pendingTasks, inProgressTasks, totalUploads, recentActivity] =
      await Promise.all([
        Agent.countDocuments(),
        Task.countDocuments(),
        Task.countDocuments({ status: "completed" }),
        Task.countDocuments({ status: "pending" }),
        Task.countDocuments({ status: "in-progress" }),
        Upload.countDocuments(),
        // Get recent activity from uploads and tasks
        Promise.all([
          Upload.find().sort({ createdAt: -1 }).limit(3).populate("uploadedBy", "name"),
          Task.find().sort({ updatedAt: -1 }).limit(3).populate("assignedTo", "name"),
        ]),
      ])

    const [recentUploads, recentTasks] = recentActivity

    // Calculate rates
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const averageTasksPerAgent = totalAgents > 0 ? totalTasks / totalAgents : 0

    // Format recent activity
    const activity = [
      ...recentUploads.map((upload) => ({
        id: upload._id,
        type: "upload",
        message: `File "${upload.filename}" uploaded`,
        timestamp: upload.createdAt,
        user: upload.uploadedBy?.name || "Unknown",
      })),
      ...recentTasks.map((task) => ({
        id: task._id,
        type: "task",
        message: `Task "${task.title}" ${task.status}`,
        timestamp: task.updatedAt,
        agent: task.assignedTo?.name || "Unassigned",
      })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    return NextResponse.json({
      stats: {
        totalAgents,
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        totalUploads,
        completionRate,
        averageTasksPerAgent,
      },
      recentActivity: activity,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
