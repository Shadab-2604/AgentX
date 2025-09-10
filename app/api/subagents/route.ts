import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { subAgentService } from "@/lib/subagents"

export async function GET(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || undefined

    // If caller is an agent, constrain listing to their own sub-agents
    // Admins may pass ownerAgentId to inspect another agent's sub-agents
    const ownerAgentId = user.role === "admin" ? searchParams.get("ownerAgentId") || user._id : user._id

    const result = await subAgentService.listSubAgents(ownerAgentId, page, limit, search)

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("List sub-agents error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, mobile, active = true, capacity } = body

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Determine owner agent context
    const ownerAgentId = user.role === "admin" ? body.ownerAgentId || user._id : user._id

    const sub = await subAgentService.createSubAgent({
      ownerAgentId,
      name: name.trim(),
      email: String(email).toLowerCase(),
      mobile,
      active: Boolean(active),
      capacity: typeof capacity === "number" ? capacity : undefined,
    })

    return NextResponse.json({ success: true, subAgent: sub }, { status: 201 })
  } catch (error) {
    console.error("Create sub-agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
