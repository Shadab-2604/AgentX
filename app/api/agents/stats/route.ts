import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { agentService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const totalAgents = await agentService.getAgentCount()

    return NextResponse.json({
      success: true,
      stats: {
        totalAgents,
      },
    })
  } catch (error) {
    console.error("Get agent stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
