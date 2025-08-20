import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("agentx")

    // Check if user already exists
    const existingUser = await db.collection("admins").findOne({ email })

    if (existingUser) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new admin user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: "admin" as const,
      createdAt: new Date(),
    }

    const result = await db.collection("admins").insertOne(newUser)

    // Generate JWT token
    const token = generateToken({
      _id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        _id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
