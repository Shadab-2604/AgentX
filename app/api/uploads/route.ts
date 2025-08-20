import { type NextRequest, NextResponse } from "next/server"
import { authenticateRequest } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

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

    const client = await clientPromise
    const db = client.db("agentx")
    const uploadsCollection = db.collection("uploads")

    const total = await uploadsCollection.countDocuments()
    const totalPages = Math.ceil(total / limit)
    const skip = (page - 1) * limit

    const uploads = await uploadsCollection.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()

    return NextResponse.json({
      success: true,
      uploads: uploads.map((upload) => ({
        ...upload,
        _id: upload._id.toString(),
      })),
      total,
      page,
      totalPages,
    })
  } catch (error) {
    console.error("Get uploads error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
