import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("agentx")

    // Find admin or agent user
    let user: any = await db.collection("admins").findOne({ email })
    let role: "admin" | "agent" = "admin"

    if (!user) {
      const agent = await db.collection("agents").findOne({ email })
      if (!agent) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }
      user = agent
      role = "agent"
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Generate JWT token
    const token = generateToken({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
