import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { agentService } from "@/lib/database"
import { validateAgentData } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    // Authenticate request
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined

    const result = await agentService.getAgents(page, limit, search)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error("Get agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate request
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate input data
    const validation = validateAgentData(data)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 },
      )
    }

    const agent = await agentService.createAgent(data)

    return NextResponse.json(
      {
        success: true,
        agent: {
          _id: agent._id,
          name: agent.name,
          email: agent.email,
          mobile: agent.mobile,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Create agent error:", error)

    if (error instanceof Error && error.message === "Agent with this email already exists") {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
