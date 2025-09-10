import { type NextRequest, NextResponse } from "next/server"
import clientPromise, { connectDB } from "@/lib/mongodb"
import { Upload } from "@/lib/models"
import { verifyToken } from "@/lib/auth"
import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Authorization header required" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    // Find the upload
    const upload = await Upload.findById(params.id)
    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 })
    }

    // Delete from Cloudinary if URL exists
    if (upload.cloudinaryUrl) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = upload.cloudinaryUrl.split("/")
        const publicIdWithExtension = urlParts[urlParts.length - 1]
        const publicId = publicIdWithExtension.split(".")[0]

        await cloudinary.uploader.destroy(publicId)
      } catch (cloudinaryError) {
        console.error("Failed to delete from Cloudinary:", cloudinaryError)
        // Continue with database deletion even if Cloudinary fails
      }
    }

    // Delete tasks associated with this upload
    try {
      const client = await clientPromise
      const db = client.db("agentx")
      await db.collection("tasks").deleteMany({ uploadId: params.id })
    } catch (cleanupErr) {
      console.error("Failed to delete tasks for upload:", params.id, cleanupErr)
      // Proceed to delete upload record even if task deletion fails
    }

    // Delete from database
    await Upload.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("Delete upload error:", error)
    return NextResponse.json({ error: "Failed to delete upload" }, { status: 500 })
  }
}
