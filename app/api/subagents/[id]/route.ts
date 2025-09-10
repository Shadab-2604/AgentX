import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import { subAgentService } from "@/lib/subagents"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const updated = await subAgentService.updateSubAgent(params.id, {
      name: body.name,
      email: body.email,
      mobile: body.mobile,
      active: body.active,
      capacity: body.capacity,
    })

    if (!updated) {
      return NextResponse.json({ error: "Sub-agent not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, subAgent: updated })
  } catch (error) {
    console.error("Update sub-agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const ok = await subAgentService.deleteSubAgent(params.id)
    if (!ok) {
      return NextResponse.json({ error: "Sub-agent not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete sub-agent error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
